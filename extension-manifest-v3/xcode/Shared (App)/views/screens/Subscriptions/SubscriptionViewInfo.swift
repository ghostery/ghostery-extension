//
//  ContentView.swift
//  Ghostery
//
//  Created by Krzysztof Jan Modras on 29.11.21.
//

import SwiftUI
import StoreKit

struct SubscriptionInfoView: View {

    @EnvironmentObject var storeHelper: StoreHelper
    @State var subscriptionInfoText = ""
    var subscriptionInfo: SubscriptionInfo

    var body: some View {

        let viewModel = SubscriptionInfoViewModel(storeHelper: storeHelper, subscriptionInfo: subscriptionInfo)

        Text(subscriptionInfoText)
            .font(.footnote)
            .foregroundColor(.gray)
            .lineLimit(nil)
            .frame(maxWidth: .infinity, alignment: .leading)
            .fixedSize(horizontal: false, vertical: true)
            .onAppear {
                Task.init { subscriptionInfoText = await viewModel.info() }
            }
    }
}

