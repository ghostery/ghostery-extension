//
//  StoreHelper.swift
//  StoreHelper
//
//  Created by Russell Archer on 16/06/2021.
//

import StoreKit
import OrderedCollections

public typealias ProductId = String

/// The state of a purchase.
public enum PurchaseState { case notStarted, userCannotMakePayments, inProgress, purchased, pending, cancelled, failed, failedVerification, unknown }

/// Information on the result of unwrapping a transaction `VerificationResult`.
public struct UnwrappedVerificationResult<T> {
    /// The verified or unverified transaction.
    let transaction: T

    /// True if the transaction was successfully verified by StoreKit.
    let verified: Bool

    /// If `verified` is false then `verificationError` will hold the verification error, nil otherwise.
    let verificationError: VerificationResult<T>.VerificationError?
}

@available(iOS 15.0, macOS 12.0, *)
/// StoreHelper encapsulates StoreKit2 in-app purchase functionality and makes it easy to work with the App Store.
public class StoreHelper: ObservableObject {

    // MARK: - Public properties

    /// Array of `Product` retrieved from the App Store and available for purchase.
    @Published private(set) var products: [Product]?

    /// Array of `ProductId` for products that have been purchased. Each purchased non-consumable product will appear
    /// exactly once. Consumable products can appear more than once.
    ///
    /// This array is primarily used to trigger updates in the UI. It is not persisted but re-built as required
    /// whenever a purchase successfully completes, or when a call is made to `isPurchased(product:)`.
    ///
    /// - Call `isPurchased(product:)` to see if any type of product has been purchased and validated against the receipt.
    /// - Call `StoreHelper.count(for:)` to see how many times a consumable product has been purchased.
    @Published private(set) var purchasedProducts = [ProductId]()

    /// `OrderedSet` of `ProductId` that have been read from the Product.plist configuration file. The order in which
    /// product ids are defined in the property list file is maintained in the set.
    public private(set) var productIds: OrderedSet<ProductId>?

    /// Subscription-related helper methods.
    public var subscriptionHelper: SubscriptionHelper!

    // MARK: - Public helper properties

    public var consumableProducts:      [Product]?   { products?.filter { $0.type == .consumable }}
    public var nonConsumableProducts:   [Product]?   { products?.filter { $0.type == .nonConsumable }}
    public var subscriptionProducts:    [Product]?   { products?.filter { $0.type == .autoRenewable }}
    public var consumableProductIds:    [ProductId]? { products?.filter { $0.type == .consumable }.map { $0.id }}
    public var nonConsumableProductIds: [ProductId]? { products?.filter { $0.type == .nonConsumable }.map { $0.id }}
    public var subscriptionProductIds:  [ProductId]? { products?.filter { $0.type == .autoRenewable }.map { $0.id }}

    /// True if we have a list of `Product` returned to us by the App Store.
    public var hasProducts: Bool {
        guard products != nil else { return false }
        return products!.count > 0 ? true : false
    }

    // MARK: - Private properties

    /// Handle for App Store transactions.
    private var transactionListener: Task<Void, Error>? = nil

    /// The current internal state of StoreHelper. If `purchaseState == inProgress` then an attempt to start
    /// a new purchase will result in a `purchaseInProgressException` being thrown by `purchase(_:)`.
    private var purchaseState: PurchaseState = .unknown

    // MARK: - Initialization

    /// StoreHelper enables support for working with in-app purchases and StoreKit2 using the async/await pattern.
    ///
    /// During initialization StoreHelper will:
    /// - Read the Products.plist configuration file to get a list of `ProductId` that defines the set of products we'll request from the App Store.
    /// - Start listening for App Store transactions.
    /// - Request localized product info from the App Store.
    @MainActor init() {

        // Initialize our subscription helper
        subscriptionHelper = SubscriptionHelper(storeHelper: self)

        // Listen for App Store transactions
        transactionListener = handleTransactions()

        // Read our list of product ids
        productIds = Configuration.readConfigFile()
        guard productIds != nil else { return }

        // Get localized product info from the App Store
        StoreLog.event(.requestProductsStarted)

        Task.init {

            products = await requestProductsFromAppStore(productIds: productIds!)

            // As currently coded the app will never know if new products are added to the App Store.
            // We should probably add the ability to periodically re-fetch the product list.
            guard products != nil else {
                StoreLog.event(.requestProductsFailure)
                return
            }

            StoreLog.event(.requestProductsSuccess)
        }
    }

    deinit { transactionListener?.cancel() }

    // MARK: - Public methods

    /// Request localized product info from the App Store for a set of ProductId.
    ///
    /// This method runs on the main thread because it will result in updates to the UI.
    /// - Parameter productIds: The product ids that you want localized information for.
    /// - Returns: Returns an array of `Product`, or nil if no product information is returned by the App Store.
    @MainActor public func requestProductsFromAppStore(productIds: OrderedSet<ProductId>) async -> [Product]? {

        return try? await Product.products(for: productIds)
    }

    /// Requests the most recent transaction for a product from the App Store and determines if it has been previously purchased.
    ///
    /// May throw an exception of type `StoreException.transactionVerificationFailed`.
    /// - Parameter productId: The `ProductId` of the product.
    /// - Returns: Returns true if the product has been purchased, false otherwise.
    @MainActor public func isPurchased(productId: ProductId) async throws -> Bool {

        guard let product = product(from: productId) else { return false }

        // We need to treat consumables differently because their transaction are NOT stored in the receipt.
        if product.type == .consumable {
            await updatePurchasedIdentifiers(productId, insert: true)
            return KeychainHelper.count(for: productId) > 0
        }

        guard let currentEntitlement = await Transaction.currentEntitlement(for: productId) else {
            return false  // There's no transaction for the product, so it hasn't been purchased
        }

        // See if the transaction passed StoreKit's automatic verification
        let result = checkVerificationResult(result: currentEntitlement)
        if !result.verified {
            StoreLog.transaction(.transactionValidationFailure, productId: result.transaction.productID)
            throw StoreException.transactionVerificationFailed
        }

        // Make sure our internal set of purchase pids is in-sync with the App Store
        await updatePurchasedIdentifiers(result.transaction)

        // See if the App Store has revoked the users access to the product (e.g. because of a refund).
        // If this transaction represents a subscription, see if the user upgraded to a higher-level subscription.
        return result.transaction.revocationDate == nil && !result.transaction.isUpgraded
    }

    /// Requests the most recent transaction for a product from the App Store and determines if it has been previously purchased.
    ///
    /// May throw an exception of type `StoreException.transactionVerificationFailed`.
    /// - Parameter productId: The `ProductId` of the product.
    /// - Returns: Returns true if the product has been purchased, false otherwise.
    @MainActor public func isPurchased(product: Product) async throws -> Bool {

        return try await isPurchased(productId: product.id)
    }

    /// Uses StoreKit's `Transaction.currentEntitlements` property to iterate over the sequence of `VerificationResult<Transaction>`
    /// representing all transactions for products the user is currently entitled to. That is, all currently-subscribed
    /// transactions and all purchased (and not refunded) non-consumables. Note that transactions for consumables are NOT
    /// in the receipt.
    /// - Returns: A verified `Set<ProductId>` for all products the user is entitled to have access to. The set will be empty if the
    /// user has not purchased anything previously.
    @MainActor public func currentEntitlements() async -> Set<ProductId> {

        var entitledProductIds = Set<ProductId>()

        for await result in Transaction.currentEntitlements {

            if case .verified(let transaction) = result {
                entitledProductIds.insert(transaction.productID)  // Ignore unverified transactions
            }
        }

        return entitledProductIds
    }

    /// Purchase a `Product` previously returned from the App Store following a call to `requestProductsFromAppStore()`.
    ///
    /// May throw an exception of type:
    /// - `StoreException.purchaseException` if the App Store itself throws an exception
    /// - `StoreException.purchaseInProgressException` if a purchase is already in progress
    /// - `StoreException.transactionVerificationFailed` if the purchase transaction failed verification
    ///
    /// - Parameter product: The `Product` to purchase.
    /// - Returns: Returns a tuple consisting of a transaction object that represents the purchase and a `PurchaseState`
    /// describing the state of the purchase.
    @MainActor public func purchase(_ product: Product) async throws -> (transaction: Transaction?, purchaseState: PurchaseState)  {

        guard AppStore.canMakePayments else {
            StoreLog.event(.purchaseUserCannotMakePayments)
            return (nil, .userCannotMakePayments)
        }

        guard purchaseState != .inProgress else {
            StoreLog.exception(.purchaseInProgressException, productId: product.id)
            throw StoreException.purchaseInProgressException
        }

        // Start a purchase transaction
        purchaseState = .inProgress
        StoreLog.event(.purchaseInProgress, productId: product.id)

        guard let result = try? await product.purchase() else {
            purchaseState = .failed
            StoreLog.event(.purchaseFailure, productId: product.id)
            throw StoreException.purchaseException
        }

        // Every time an app receives a transaction from StoreKit 2, the transaction has already passed through a
        // verification process to confirm whether the payload is signed by the App Store for my app for this device.
        // That is, Storekit2 does transaction (receipt) verification for you (no more OpenSSL or needing to send
        // a receipt to an Apple server for verification).

        // We now have a PurchaseResult value. See if the purchase suceeded, failed, was cancelled or is pending.
        switch result {
        case .success(let verificationResult):

            // The purchase seems to have succeeded. StoreKit has already automatically attempted to validate
            // the transaction, returning the result of this validation wrapped in a `VerificationResult`.
            // We now need to check the `VerificationResult<Transaction>` to see if the transaction passed the
            // App Store's validation process. This is equivalent to receipt validation in StoreKit1.

            // Did the transaction pass StoreKit’s automatic validation?
            let checkResult = checkVerificationResult(result: verificationResult)
            if !checkResult.verified {
                purchaseState = .failedVerification
                StoreLog.transaction(.transactionValidationFailure, productId: checkResult.transaction.productID)
                throw StoreException.transactionVerificationFailed
            }

            // The transaction was successfully validated.
            let validatedTransaction = checkResult.transaction

            // Update the list of purchased ids. Because it's is a @Published var this will cause the UI
            // showing the list of products to update
            await updatePurchasedIdentifiers(validatedTransaction)

            // Tell the App Store we delivered the purchased content to the user
            await validatedTransaction.finish()

            // Let the caller know the purchase succeeded and that the user should be given access to the product
            purchaseState = .purchased
            StoreLog.event(.purchaseSuccess, productId: product.id)

            if validatedTransaction.productType == .consumable {
                // We need to treat consumables differently because their transactions are NOT stored in the receipt.
                if KeychainHelper.purchase(product.id) { await updatePurchasedIdentifiers(product.id, insert: true) }
                else { StoreLog.event(.consumableKeychainError) }
            }

            return (transaction: validatedTransaction, purchaseState: .purchased)

        case .userCancelled:
            purchaseState = .cancelled
            StoreLog.event(.purchaseCancelled, productId: product.id)
            return (transaction: nil, .cancelled)

        case .pending:
            purchaseState = .pending
            StoreLog.event(.purchasePending, productId: product.id)
            return (transaction: nil, .pending)

        default:
            purchaseState = .unknown
            StoreLog.event(.purchaseFailure, productId: product.id)
            return (transaction: nil, .unknown)
        }
    }

    /// The `Product` associated with a `ProductId`.
    /// - Parameter productId: `ProductId`.
    /// - Returns: Returns the `Product` associated with a `ProductId`.
    public func product(from productId: ProductId) -> Product? {

        guard products != nil else { return nil }

        let matchingProduct = products!.filter { product in
            product.id == productId
        }

        guard matchingProduct.count == 1 else { return nil }
        return matchingProduct.first
    }

    /// Information on a non-consumable product.
    /// - Parameter productId: The `ProductId` of the product.
    /// - Returns: Information on a non-consumable product.
    /// If the product is not non-consumable nil is returned.
    @MainActor public func purchaseInfo(for productId: ProductId) async -> PurchaseInfo? {

        guard let p = product(from: productId) else { return nil }
        return await purchaseInfo(for: p)
    }

    /// Transaction information for a non-consumable product.
    /// - Parameter product: The `Product` you want information on.
    /// - Returns: Transaction information on a non-consumable product.
    /// If the product is not non-consumable nil is returned.
    @MainActor public func purchaseInfo(for product: Product) async -> PurchaseInfo? {

        guard product.type == .nonConsumable else { return nil }

        var purchaseInfo = PurchaseInfo(product: product)
        guard let unverifiedTransaction = await product.latestTransaction else { return nil }

        let transactionResult = checkVerificationResult(result: unverifiedTransaction)
        guard transactionResult.verified else { return nil }

        purchaseInfo.latestVerifiedTransaction = transactionResult.transaction
        return purchaseInfo
    }

    /// Information on the highest service level auto-renewing subscription the user is subscribed to
    /// in the `subscriptionGroup`.
    /// - Parameter subscriptionGroup: The name of the subscription group
    /// - Returns: Information on the highest service level auto-renewing subscription the user is
    /// subscribed to in the `subscriptionGroup`.
    ///
    /// When getting information on the highest service level auto-renewing subscription the user is
    /// subscribed to we enumerate the `Product.subscription.status` array that is a property of each
    /// `Product` in the group. Each Product in a subscription group provides access to the same
    /// `Product.SubscriptionInfo.Status` array via its `product.subscription.status` property.
    ///
    /// Enumeration of the `SubscriptionInfo.Status` array is necessary because a user may have multiple
    /// active subscriptions to products in the same subscription group. For example, a user may have
    /// subscribed themselves to the "Gold" product, as well as receiving an automatic subscription
    /// to the "Silver" product through family sharing. In this case, we'd need to return information
    /// on the "Gold" product.
    ///
    /// The `Product.subscription.status` is an array of type `[Product.SubscriptionInfo.Status]` that
    /// contains status information for ALL subscription groups. This demo app only has one subscription
    /// group, so all products in the `Product.subscription.status` array are part of the same group.
    /// In an app with two or more subscription groups you need to distinguish between groups by using
    /// the `product.subscription.subscriptionGroupID` property. Alternatively, use subscriptionHelper.groupName(from:)
    /// to find the subscription group associated with a product. This will allow you to distinguish
    /// products by group and subscription service level.
    @MainActor public func subscriptionInfo(for subscriptionGroup: String) async -> SubscriptionInfo? {

        // Get the product ids for all the products in the subscription group.
        // Take the first id and convert it to a Product so we can access the group-common subscription.status array.
        guard let groupProductIds = subscriptionHelper.subscriptions(in: subscriptionGroup),
              let groupProductId = groupProductIds.first,
              let product = product(from: groupProductId),
              let subscription = product.subscription,
              let statusCollection = try? await subscription.status else { return nil }

        var subscriptionInfo = SubscriptionInfo()
        var highestServiceLevel: Int = -1
        var highestValueProduct: Product?
        var highestValueTransaction: Transaction?
        var highestValueStatus: Product.SubscriptionInfo.Status?
        var highestRenewalInfo: Product.SubscriptionInfo.RenewalInfo?

        for status in statusCollection {

            // If the user's not subscribed to this product then keep looking
            guard status.state == .subscribed else { continue }

            // Check the transaction verification
            let statusTransactionResult = checkVerificationResult(result: status.transaction)
            guard statusTransactionResult.verified else { continue }

            // Check the renewal info verification
            let renewalInfoResult = checkVerificationResult(result: status.renewalInfo)
            guard renewalInfoResult.verified else { continue }  // Subscription not verified by StoreKit so ignore it

            // Make sure this product is from the same subscription group as the product we're searching for
            let currentGroup = subscriptionHelper.groupName(from: renewalInfoResult.transaction.currentProductID)
            guard currentGroup == subscriptionGroup else { continue }

            // Get the Product for this subscription
            guard let candidateSubscription = self.product(from: renewalInfoResult.transaction.currentProductID) else { continue }

            // We've found a valid transaction for a product in the target subscription group.
            // Is it's service level the highest we've encountered so far?
            let currentServiceLevel = subscriptionHelper.subscriptionServiceLevel(in: subscriptionGroup, for: renewalInfoResult.transaction.currentProductID)
            if currentServiceLevel > highestServiceLevel {
                highestServiceLevel = currentServiceLevel
                highestValueProduct = candidateSubscription
                highestValueTransaction = statusTransactionResult.transaction
                highestValueStatus = status
                highestRenewalInfo = renewalInfoResult.transaction
            }
        }

        guard let selectedProduct = highestValueProduct, let selectedStatus = highestValueStatus else { return nil }

        subscriptionInfo.product = selectedProduct
        subscriptionInfo.subscriptionGroup = subscriptionGroup
        subscriptionInfo.latestVerifiedTransaction = highestValueTransaction
        subscriptionInfo.verifiedSubscriptionRenewalInfo = highestRenewalInfo
        subscriptionInfo.subscriptionStatus = selectedStatus

        return subscriptionInfo
    }

    /// Check if StoreKit was able to automatically verify a transaction by inspecting the verification result.
    ///
    /// - Parameter result: The transaction VerificationResult to check.
    /// - Returns: Returns an `UnwrappedVerificationResult<T>` where `verified` is true if the transaction was
    /// successfully verified by StoreKit. When `verified` is false `verificationError` will be non-nil.
    @MainActor public func checkVerificationResult<T>(result: VerificationResult<T>) -> UnwrappedVerificationResult<T> {

        switch result {
        case .unverified(let unverifiedTransaction, let error):
            // StoreKit failed to automatically validate the transaction
            return UnwrappedVerificationResult(transaction: unverifiedTransaction, verified: false, verificationError: error)

        case .verified(let verifiedTransaction):
            // StoreKit successfully automatically validated the transaction
            return UnwrappedVerificationResult(transaction: verifiedTransaction, verified: true, verificationError: nil)
        }
    }

    // MARK: - Internal methods

    /// Update our list of purchased product identifiers (see `purchasedProducts`).
    ///
    /// This method runs on the main thread because it will result in updates to the UI.
    /// - Parameter transaction: The `Transaction` that will result in changes to `purchasedProducts`.
    @MainActor internal func updatePurchasedIdentifiers(_ transaction: Transaction) async {

        if transaction.revocationDate == nil {

            // The transaction has NOT been revoked by the App Store so this product has been purchase.
            // Add the ProductId to the list of `purchasedProducts` (it's a Set so it won't add if already there).
            await updatePurchasedIdentifiers(transaction.productID, insert: true)

        } else {

            // The App Store revoked this transaction (e.g. a refund), meaning the user should not have access to it.
            // Remove the product from the list of `purchasedProducts`.
            await updatePurchasedIdentifiers(transaction.productID, insert: false)
        }
    }

    /// Update our list of purchased product identifiers (see `purchasedProducts`).
    /// - Parameters:
    ///   - productId: The `ProductId` to insert/remove.
    ///   - insert: If true the `ProductId` is inserted, otherwise it's removed.
    @MainActor internal func updatePurchasedIdentifiers(_ productId: ProductId, insert: Bool) async {

        guard let product = product(from: productId) else { return }

        if insert {

            if product.type == .consumable {

                let count = KeychainHelper.count(for: productId)
                let products = purchasedProducts.filter({ $0 == productId })
                if count == products.count { return }

            } else {

                if purchasedProducts.contains(productId) { return }
            }

            purchasedProducts.append(productId)

        } else {

            if let index = purchasedProducts.firstIndex(where: { $0 == productId}) {
                purchasedProducts.remove(at: index)
            }
        }
    }

    // MARK: - Private methods

    /// This is an infinite async sequence (loop). It will continue waiting for transactions until it is explicitly
    /// canceled by calling the Task.cancel() method. See `transactionListener`.
    /// - Returns: Returns a task for the transaction handling loop task.
    @MainActor private func handleTransactions() -> Task<Void, Error> {

        return Task.detached {

            for await verificationResult in Transaction.updates {

                // See if StoreKit validated the transaction
                let checkResult = await self.checkVerificationResult(result: verificationResult)
                StoreLog.transaction(.transactionReceived, productId: checkResult.transaction.productID)

                if checkResult.verified {

                    let validatedTransaction = checkResult.transaction

                    // The transaction was validated so update the list of products the user has access to
                    await self.updatePurchasedIdentifiers(validatedTransaction)
                    await validatedTransaction.finish()

                } else {

                    // StoreKit's attempts to validate the transaction failed. Don't deliver content to the user.
                    StoreLog.transaction(.transactionFailure, productId: checkResult.transaction.productID)
                }
            }
        }
    }
}


