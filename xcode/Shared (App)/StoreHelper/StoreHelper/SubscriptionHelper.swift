//
//  StoreHelper+Subscription.swift
//  StoreHelper+Subscription
//
//  Created by Russell Archer on 27/07/2021.
//
//  Subscription-related methods

import StoreKit
import OrderedCollections

/// Helper class for subscriptions.
///
/// The methods in this class require that auto-renewing subscription product ids adopt the naming
/// convention: "com.{author}.subscription.{subscription-group-name}.{product-name}".
/// For example, "com.rarcher.subscription.vip.bronze".
///
/// Also, service level relies on the ordering of product ids within a subscription group in the
/// Products.plist file. A product appearing higher (towards the top of the group) will have a higher
/// service level than one appearing lower down. If a group has three subscription products then the
/// highest service level product will have a service level of 2, while the third product will have
/// a service level of 0.
public struct SubscriptionHelper {

    weak public var storeHelper: StoreHelper?

    private static let productIdSubscriptionName = "subscription"
    private static let productIdSeparator = "."

    /// Determines the group name(s) present in the set of subscription product ids defined in Products.plist.
    /// - Returns: Returns the group name(s) present in the `OrderedSet` of subscription product ids held by `StoreHelper`.
    public func groups() -> OrderedSet<String>? {

        guard let store = storeHelper else { return nil }
        var subscriptionGroups = OrderedSet<String>()

        if let spids = store.subscriptionProductIds {
            spids.forEach { productId in
                if let group = groupName(from: productId) {
                    subscriptionGroups.append(group)
                }
            }
        }

        return subscriptionGroups.count > 0 ? subscriptionGroups : nil
    }

    /// Returns the set of product ids that belong to a named subscription group in order of value.
    /// - Parameter group: The group name.
    /// - Returns: Returns the set of product ids that belong to a named subscription group in order of value.
    public func subscriptions(in group: String) -> OrderedSet<ProductId>? {

        guard let store = storeHelper else { return nil }
        var matchedProductIds = OrderedSet<ProductId>()

        if let spids = store.subscriptionProductIds {
            spids.forEach { productId in
                if let matchedGroup = groupName(from: productId), matchedGroup.lowercased() == group.lowercased() {
                    matchedProductIds.append(productId)
                }
            }
        }

        return matchedProductIds.count > 0 ? matchedProductIds : nil
    }

    /// Extracts the name of the subscription group present in the `ProductId`.
    /// - Parameter productId: The `ProductId` from which to extract a subscription group name.
    /// - Returns: Returns the name of the subscription group present in the `ProductId`.
    public func groupName(from productId: ProductId) -> String? {

        let components = productId.components(separatedBy: SubscriptionHelper.productIdSeparator)
        for i in 0...components.count-1 {
            if components[i].lowercased() == SubscriptionHelper.productIdSubscriptionName {
                if i+1 < components.count { return components[i+1] }
            }
        }

        return nil
    }

    /// Provides the service level for a `ProductId` in a subscription group.
    ///
    /// Service level relies on the ordering of product ids within a subscription group in the Products.plist file.
    /// A product appearing higher (towards the top of the group) will have a higher service level than one appearing
    /// lower down. If a group has three subscription products then the highest service level product will have a
    /// service level of 2, while the third product will have a service level of 0.
    /// - Parameters:
    ///   - group: The subscription group name.
    ///   - productId: The `ProductId` who's service level you require.
    /// - Returns: The service level for a `ProductId` in a subscription group, or -1 if `ProductId` cannot be found.
    public func subscriptionServiceLevel(in group: String, for productId: ProductId) -> Int {

        guard let products = subscriptions(in: group) else { return -1 }

        var index = products.count-1
        for i in 0...products.count-1 {
            if products[i] == productId { return index }
            index -= 1
        }

        return -1
    }
}

