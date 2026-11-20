//
//  Donations.swift
//  Ghostery
//
//  Donations through the App Store, offered by the Contribute section.
//

import Observation
import StoreKit

fileprivate enum Constants {
  // Products of the donations in the App Store, which Products.storekit also
  // has for the testing in Xcode
  static let productIDs = [
    "com.ghostery.subscription.plus.onetime.small",
    "com.ghostery.subscription.plus.onetime.medium",
    "com.ghostery.subscription.plus.onetime.large",
    "com.ghostery.subscription.plus.month.small",
    "com.ghostery.subscription.plus.month.medium",
    "com.ghostery.subscription.plus.month.large",
    "com.ghostery.subscription.plus.year.small",
    "com.ghostery.subscription.plus.year.medium",
    "com.ghostery.subscription.plus.year.large",
  ]
}

/// How often a donation is made, each with its own set of products
enum DonationPeriod: CaseIterable, Identifiable {
  case monthly
  case yearly
  case oneTime

  var id: Self { self }

  fileprivate func includes(_ product: Product) -> Bool {
    switch self {
    case .monthly:
      return product.type == .autoRenewable && product.subscription?.subscriptionPeriod.unit == .month
    case .yearly:
      return product.type == .autoRenewable && product.subscription?.subscriptionPeriod.unit == .year
    case .oneTime:
      return product.type == .consumable
    }
  }
}

/// Result of a donation, for the user interface
enum DonationResult {
  case donated
  /// Waits for an approval, like the one of a parent with Ask to Buy
  case pending
  case cancelled
  case failed
}

/// Products of the donations, and their purchases. It handles the
/// transactions of the App Store from the launch of the app.
@MainActor
@Observable
final class Donations {
  static let shared = Donations()

  private(set) var isDonating = false
  private(set) var isRestoring = false
  /// Whether the user has an active monthly or yearly donation
  private(set) var isSubscribed = false
  /// Of each period, from the smallest donation, loaded from the App Store
  /// after the start
  private var products: [DonationPeriod: [Product]] = [:]

  @ObservationIgnored private var transactionUpdates: Task<Void, Never>?
  @ObservationIgnored private var isLoadingProducts = false

  private init() {}

  /// Finishes the transactions of the App Store which the app didn't finish
  /// yet, like the ones of donations approved with Ask to Buy, and loads the
  /// products. Called when the app launches.
  func start() {
    guard transactionUpdates == nil else { return }

    transactionUpdates = Task {
      for await result in Transaction.updates {
        // The ones StoreKit can't verify are left unfinished
        if case .verified(let transaction) = result {
          await transaction.finish()
        }
        await refreshSubscription()
      }
    }
    Task { await refreshSubscription() }
    Task { await loadProducts() }
  }

  /// Loads the products from the App Store, unless they're loaded already
  func loadProducts() async {
    guard products.isEmpty, !isLoadingProducts else { return }
    isLoadingProducts = true
    defer { isLoadingProducts = false }

    guard let loaded = try? await Product.products(for: Constants.productIDs), !loaded.isEmpty else { return }
    products = Dictionary(uniqueKeysWithValues: DonationPeriod.allCases.map { period in
      (period, loaded.filter(period.includes).sorted { $0.price < $1.price })
    })
  }

  /// Products of the period, from the smallest donation
  func products(for period: DonationPeriod) -> [Product] {
    products[period] ?? []
  }

  /// Product selected at first, in the middle of the amounts
  func defaultProduct(for period: DonationPeriod) -> Product? {
    let products = products(for: period)
    return products.isEmpty ? nil : products[products.count / 2]
  }

  /// Shows the payment sheet of the App Store
  func donate(_ product: Product) async -> DonationResult {
    // One donation at a time
    guard !isDonating else { return .cancelled }
    guard AppStore.canMakePayments else { return .failed }
    isDonating = true
    defer { isDonating = false }

    do {
      switch try await product.purchase() {
      case .success(.verified(let transaction)):
        await transaction.finish()
        await refreshSubscription()
        return .donated
      case .success(.unverified):
        return .failed
      case .pending:
        return .pending
      case .userCancelled:
        return .cancelled
      @unknown default:
        return .failed
      }
    } catch {
      return .failed
    }
  }

  /// Restores the subscriptions bought with the Apple Account of the user
  func restore() async {
    guard !isRestoring else { return }
    isRestoring = true
    defer { isRestoring = false }
    try? await AppStore.sync()
    await refreshSubscription()
  }

  /// Checks the subscriptions with the App Store, which doesn't notify
  /// about their expiration
  func refreshSubscription() async {
    var isSubscribed = false
    for await result in Transaction.currentEntitlements {
      guard case .verified(let transaction) = result,
            transaction.productType == .autoRenewable,
            transaction.revocationDate == nil,
            (transaction.expirationDate ?? .distantFuture) > .now
      else { continue }
      isSubscribed = true
    }
    if self.isSubscribed != isSubscribed {
      self.isSubscribed = isSubscribed
    }
  }
}
