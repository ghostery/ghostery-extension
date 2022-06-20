//
//  StoreNotification.swift
//  StoreHelper
//
//  Created by Russell Archer on 16/06/2021.
//

import Foundation
import SwiftUI

/// StoreHelper exceptions
public enum StoreException: Error, Equatable {
    case purchaseException
    case purchaseInProgressException
    case transactionVerificationFailed

    public func shortDescription() -> LocalizedStringKey {
        switch self {
        case .purchaseException:                    return "Exception. StoreKit throw an exception while processing a purchase"
        case .purchaseInProgressException:          return "Exception. You can't start another purchase yet, one is already in progress"
        case .transactionVerificationFailed:        return "Exception. A transaction failed StoreKit's automatic verification"
        }
    }
}

/// Informational logging notifications issued by StoreHelper
public enum StoreNotification: Error, Equatable {

    case configurationNotFound
    case configurationEmpty
    case configurationSuccess
    case configurationFailure

    case requestProductsStarted
    case requestProductsSuccess
    case requestProductsFailure

    case purchaseUserCannotMakePayments
    case purchaseAlreadyInProgress
    case purchaseInProgress
    case purchaseCancelled
    case purchasePending
    case purchaseSuccess
    case purchaseFailure

    case transactionReceived
    case transactionValidationSuccess
    case transactionValidationFailure
    case transactionFailure
    case transactionSuccess
    case transactionRevoked
    case transactionRefundRequested
    case transactionRefundFailed

    case consumableSavedInKeychain
    case consumableKeychainError

    /// A short description of the notification.
    /// - Returns: Returns a short description of the notification.
    public func shortDescription() -> LocalizedStringKey {
        switch self {

        case .configurationNotFound:           return "Configuration file not found in the main bundle"
        case .configurationEmpty:              return "Configuration file does not contain any product definitions"
        case .configurationSuccess:            return "Configuration success"
        case .configurationFailure:            return "Configuration failure"

        case .requestProductsStarted:          return "Request products from the App Store started"
        case .requestProductsSuccess:          return "Request products from the App Store success"
        case .requestProductsFailure:          return "Request products from the App Store failure"

        case .purchaseUserCannotMakePayments:  return "Purchase failed because the user cannot make payments"
        case .purchaseAlreadyInProgress:       return "Purchase already in progress"
        case .purchaseInProgress:              return "Purchase in progress"
        case .purchasePending:                 return "Purchase in progress. Awaiting authorization"
        case .purchaseCancelled:               return "Purchase cancelled"
        case .purchaseSuccess:                 return "Purchase success"
        case .purchaseFailure:                 return "Purchase failure"

        case .transactionReceived:             return "Transaction received"
        case .transactionValidationSuccess:    return "Transaction validation success"
        case .transactionValidationFailure:    return "Transaction validation failure"
        case .transactionFailure:              return "Transaction failure"
        case .transactionSuccess:              return "Transaction success"
        case .transactionRevoked:              return "Transaction was revoked (refunded) by the App Store"
        case .transactionRefundRequested:      return "Transaction refund successfully requested"
        case .transactionRefundFailed:         return "Transaction refund request failed"

        case .consumableSavedInKeychain:       return "Consumable purchase successfully saved to the keychain"
        case .consumableKeychainError:         return "Keychain error"
        }
    }
}
