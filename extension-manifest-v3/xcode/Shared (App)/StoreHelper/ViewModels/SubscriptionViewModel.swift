//
//  SubscriptionInfoViewModel.swift
//  SubscriptionInfoViewModel
//
//  Created by Russell Archer on 07/08/2021.
//

import StoreKit
import SwiftUI

struct SubscriptionInfoViewModel {

    @ObservedObject var storeHelper: StoreHelper
    var subscriptionInfo: SubscriptionInfo

    @MainActor func info() async -> String {

        var text = ""
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "d MMM y"

        if let state = subscriptionInfo.subscriptionStatus?.state {
            switch state {
            case .subscribed: text += "Your are now subscribed."
            case .inGracePeriod: text += "Your are now subscribed. Subscription expires shortly."
            case .inBillingRetryPeriod: text += "Subscribed. Renewal failed."
            case .revoked: text += "Subscription revoked."
            case .expired: text += "Subscription expired."
            default: text += "Subscription state unknown."
            }
        }

        text += " Subscription details: "

        if let subscription = subscriptionInfo.product?.subscription {
            var periodUnitText: String
            switch subscription.subscriptionPeriod.unit {

            case .day:   periodUnitText = subscription.subscriptionPeriod.value > 1 ? String(subscription.subscriptionPeriod.value) + "days"   : "day"
            case .week:  periodUnitText = subscription.subscriptionPeriod.value > 1 ? String(subscription.subscriptionPeriod.value) + "weeks"  : "week"
            case .month: periodUnitText = subscription.subscriptionPeriod.value > 1 ? String(subscription.subscriptionPeriod.value) + "months" : "month"
            case .year:  periodUnitText = subscription.subscriptionPeriod.value > 1 ? String(subscription.subscriptionPeriod.value) + "years"  : "year"
            @unknown default: periodUnitText = "period unknown."
            }

            text += " Renews every \(periodUnitText)."
        }

        if let renewalInfo = subscriptionInfo.verifiedSubscriptionRenewalInfo {
            text += " Auto-renew"
            text += renewalInfo.willAutoRenew ? " on." : " off."

        } else { text += " Renewal info not verified." }

        if let latestTransaction = subscriptionInfo.latestVerifiedTransaction,
           let renewalDate = latestTransaction.expirationDate {

            if latestTransaction.isUpgraded { text += " Upgraded" }
            else  {

                text += " Renews \(dateFormatter.string(from: renewalDate))."

                let diffComponents = Calendar.current.dateComponents([.day], from: Date(), to: renewalDate)
                if let daysLeft = diffComponents.day {
                    text += " Renews in \(daysLeft)"
                    if daysLeft > 1 { text += " days." }
                    else if daysLeft == 1 { text += " day." }
                    else { text += " Renews today." }
                }
            }
        }

        return text
    }
}
