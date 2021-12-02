//
//  KeychainHelper.swift
//  StoreHelper
//
//  Created by Russell Archer on 09/07/2021.
//

import Foundation
import Security

/// A consumable product id and associated count value.
///
/// Consumable product purchase transactions are considered transient by Apple and are
/// therefore not stored in the App Store receipt. `KeychainHelper` uses `ConsumableProductId`
/// to store consumable product ids in the keychain. Each time the consumable is purchased the
/// count should incremented. When a purchase is expired the count is decremented. When the count
/// reaches zero the user no longer has access to the product.
public struct ConsumableProductId: Hashable {
    let productId: ProductId
    let count: Int
}

/// KeychainHelper provides methods for working with collections of `ConsumableProductId` in the keychain.
public struct KeychainHelper {

    /// Add a consumable `ProductId` to the keychain and set its count value to 1.
    /// If the keychain already contains the `ProductId` its count value is incremented.
    /// - Parameter productId: The consumable `ProductId` for which the count value will be incremented.
    /// - Returns: Returns true if the purchase was added or updated, false otherwise.
    @MainActor public static func purchase(_ productId: ProductId) -> Bool {

        if has(productId) { return update(productId, purchase: true) }

        // Create a query for what we want to add to the keychain
        let query: [String : Any] = [kSecClass as String  : kSecClassGenericPassword,
                                     kSecAttrAccount as String : productId,
                                     kSecValueData as String : "1".data(using: .utf8)!]

        // Add the item to the keychain
        let status = SecItemAdd(query as CFDictionary, nil)
        return status == errSecSuccess
    }

    /// Decrements the purchase count for a consumable `ProductId` in the keychain. If the count value is
    /// already zero no action is taken.
    /// - Parameter productId: The consumable `ProductId` for which the count value will be decremented.
    /// - Returns: Returns true if the product was expired (removed), false otherwise.
    @MainActor public static func expire(_ productId: ProductId) -> Bool {
        update(productId, purchase: false)
    }

    /// Search the keychain for a consumable `ProductId`.
    /// - Parameter productId: The consumable `ProductId` to search for.
    /// - Returns: Returns true if the consumable `ProductId` was found in the keychain, false otherwise.
    @MainActor public static func has(_ productId: ProductId) -> Bool {

        // Create a query of what we want to search for. Note we don't restrict the search (kSecMatchLimitAll)
        let query = [kSecClass as String : kSecClassGenericPassword,
                     kSecAttrAccount as String : productId,
                     kSecMatchLimit as String: kSecMatchLimitOne] as CFDictionary

        // Search for the item in the keychain
        var item: CFTypeRef?
        let status = SecItemCopyMatching(query, &item)
        return status == errSecSuccess
    }

    /// Gives the count for purchases for a consumable product. Not applicable to nonconsumables and subscriptions.
    /// - Parameter productId: The consumable `ProductId`.
    /// - Returns: Returns the value of the count, or 0 if not found.
    @MainActor public static func count(for productId: ProductId) -> Int {

        // Create a query of what we want to search for.
        let query = [kSecClass as String : kSecClassGenericPassword,
                     kSecAttrAccount as String : productId,
                     kSecMatchLimit as String: kSecMatchLimitOne,
                     kSecReturnAttributes as String: true,
                     kSecReturnData as String: true] as CFDictionary

        var item: CFTypeRef?
        let status = SecItemCopyMatching(query, &item)
        guard status == errSecSuccess else { return 0 }

        // Extract the count value data
        guard let foundItem = item as? [String : Any],
              let countData = foundItem[kSecValueData as String] as? Data,
              let countValue = String(data: countData, encoding: String.Encoding.utf8)
        else { return 0 }

        return Int(countValue) ?? 0
    }

    /// Update the count value associated with the consumable `ProductId` in the keychain.
    /// If the `ProductId` doesn't exist in the keychain it's added and its value set to 1.
    /// - Parameters:
    ///   - productId: The consumable `ProductId`.
    ///   - purchase: true if the consumable product has been purchased, false if it has been expired.
    /// - Returns: Returns true if the update was successful, false otherwise.
    @MainActor public static func update(_ productId: ProductId, purchase: Bool) -> Bool {

        if !has(productId) { return KeychainHelper.purchase(productId) }

        var count = count(for: productId)
        if count < 0 { count = 0 }

        // Create a query for what we want to change in the keychain
        let query: [String : Any] = [kSecClass as String : kSecClassGenericPassword,
                                     kSecAttrAccount as String : productId,
                                     kSecValueData as String : String(count).data(using: String.Encoding.utf8)!]

        // Create a query for changes we want to make
        var newCount = purchase ? count+1 : count-1
        if newCount < 0 { newCount = 0 }

        let changes: [String: Any] = [kSecAttrAccount as String : productId,
                                      kSecValueData as String : String(newCount).data(using: String.Encoding.utf8)!]

        // Update the item
        let status = SecItemUpdate(query as CFDictionary, changes as CFDictionary)
        return status == errSecSuccess
    }

    /// Search for all the consumable product ids for the current user that are stored in the keychain.
    /// - Parameter productIds: A set of `ProductId` that is used to match entries in the keychain to available products.
    /// - Returns: Returns a set of ConsumableProductId for all the product ids stored in the keychain.
    @MainActor public static func all(productIds: Set<ProductId>) -> Set<ConsumableProductId>? {

        // Create a query of what we want to search for. Note we don't restrict the search (kSecMatchLimitAll)
        let query = [kSecClass as String : kSecClassGenericPassword,
                     kSecMatchLimit as String: kSecMatchLimitAll,
                     kSecReturnAttributes as String: true,
                     kSecReturnData as String: true] as CFDictionary

        // Search for all the items created by this app in the keychain
        var item: CFTypeRef?
        let status = SecItemCopyMatching(query, &item)
        guard status == errSecSuccess else { return nil }

        // The item var is an array of dictionaries
        guard let entries = item as? [[String : Any]] else { return nil }

        var foundProducts = Set<ConsumableProductId>()
        for entry in entries {
            if  let pid = entry[kSecAttrAccount as String] as? String,
                productIds.contains(pid),
                let data = entry[kSecValueData as String] as? Data,
                let sValue = String(data: data, encoding: String.Encoding.utf8),
                let value = Int(sValue) {
                foundProducts.insert(ConsumableProductId(productId: pid, count: value))
            }
        }

        return foundProducts.count > 0 ? foundProducts : nil
    }

    /// Delete the `ProductId` from the keychain.
    /// - Parameter productId: `ProductId` to remove.
    /// - Returns: Returns true if the `ProductId` was deleted, false otherwise.
    @MainActor public static func delete(_ consumableProduct: ConsumableProductId) -> Bool {

        // Create a query for what we want to change in the keychain
        let query: [String : Any] = [kSecClass as String : kSecClassGenericPassword,
                                     kSecAttrAccount as String : consumableProduct.productId,
                                     kSecValueData as String : String(consumableProduct.count).data(using: String.Encoding.utf8) as Any]

        // Search for the item in the keychain
        let status = SecItemDelete(query as CFDictionary)
        return status == errSecSuccess
    }

    /// Removes all `ProductId` entries in the keychain associated with consumable product purchases.
    /// The StoreHelper collection of purchased product ids should be updated for each product id returned.
    /// For example, Task.init { await updatePurchasedIdentifiers(productId, insert: false) }.
    /// - Parameter consumableProductIds: An array of consumable `ProductId`.
    /// - Returns: Returns an array of `ProductId` that has been deleted from the keychain.
    @MainActor public static func resetKeychainConsumables(for consumableProductIds: [ProductId]) -> [ProductId]? {

        guard let cids = KeychainHelper.all(productIds: Set(consumableProductIds)) else { return nil }
        var deletedPids = [ProductId]()
        cids.forEach { cid in
            if KeychainHelper.delete(cid) { deletedPids.append(cid.productId) }
        }

        return deletedPids.count > 0 ? deletedPids : nil
    }
}

