//
//  ContentView.swift
//  Ghostery
//
//  Created by Krzysztof Jan Modras on 29.11.21.
//

import SwiftUI

/// Displays an error.
struct StoreErrorView: View {

    var body: some View {
        Text("Store Error")
            .font(.title2)
            .foregroundColor(.white)
            .padding()
            .frame(height: 40)
            .background(Color.red)
            .cornerRadius(25)
    }
}

struct StoreErrorView_Previews: PreviewProvider {
    static var previews: some View {
        StoreErrorView()
    }
}

