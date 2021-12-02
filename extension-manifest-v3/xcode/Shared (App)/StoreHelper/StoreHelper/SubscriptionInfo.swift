//
//  SubscriptionInfo.swift
//  SubscriptionInfo
//
//  Created by Russell Archer on 07/08/2021.
//

import StoreKit

/// Information about the highest service level product in a subscription group a user is subscribed to.
public struct SubscriptionInfo: Hashable {

    /// The product.
    var product: Product?

    /// The name of the subscription group `product` belongs to.
    var subscriptionGroup: String?

    /// The most recent StoreKit-verified purchase transaction for the subscription. nil if verification failed.
    var latestVerifiedTransaction: Transaction?

    /// The StoreKit-verified transaction for a subscription renewal, or nil if verification failed.
    var verifiedSubscriptionRenewalInfo:  Product.SubscriptionInfo.RenewalInfo?

    /// Info on the subscription.
    var subscriptionStatus: Product.SubscriptionInfo.Status?
}
