//
//  PriceViewModel.swift
//  StoreHelper
//
//  Created by Russell Archer on 23/06/2021.
//

import StoreKit
import SwiftUI

/// ViewModel for `PriceView`. Enables purchasing.
struct PriceViewModel {

    @ObservedObject var storeHelper: StoreHelper
    @Binding var purchaseState: PurchaseState

    /// Purchase a product using StoreHelper and StoreKit2.
    /// - Parameter product: The `Product` to purchase
    @MainActor func purchase(product: Product) async {

        do {

            let purchaseResult = try await storeHelper.purchase(product)
            withAnimation { purchaseState = purchaseResult.purchaseState }

        } catch { purchaseState = .failed }  // The purchase or validation failed
    }
}
