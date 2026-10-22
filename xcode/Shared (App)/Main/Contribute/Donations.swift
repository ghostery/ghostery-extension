//
//  Donations.swift
//  Ghostery
//
//  Donations through the App Store, offered by the Contribute section.
//

import Combine
import Observation
import StoreKit

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

/// Products of the donations, and their purchases. One instance should live
/// as long as the app, as it handles the transactions of the App Store.
@MainActor
@Observable
final class Donations {
  private(set) var isDonating = false
  private(set) var isRestoring = false
  /// Whether the user has an active monthly or yearly donation
  private(set) var isSubscribed = false
  /// Loaded from the App Store after the start
  private var products: [Product] = []

  @ObservationIgnored private let storeHelper = StoreHelper()
  @ObservationIgnored private var storeHelperChanges: Set<AnyCancellable> = []

  init() {
    // The store helper changes them on the main actor
    storeHelper.$products
      .sink { [weak self] products in
        MainActor.assumeIsolated { self?.products = products ?? [] }
      }
      .store(in: &storeHelperChanges)
    // Updated by the transactions of the App Store, also at the start
    storeHelper.$purchasedProducts
      .sink { [weak self] _ in
        Task { await self?.refreshSubscription() }
      }
      .store(in: &storeHelperChanges)
  }

  /// Whether the products are loaded from the App Store
  var isLoaded: Bool { !products.isEmpty }

  /// Products of the period, from the smallest donation
  func products(for period: DonationPeriod) -> [Product] {
    products
      .filter(period.includes)
      .sorted { $0.price < $1.price }
  }

  /// Product selected at first, in the middle of the amounts
  func defaultProduct(for period: DonationPeriod) -> Product? {
    let products = products(for: period)
    return products.isEmpty ? nil : products[products.count / 2]
  }

  /// Shows the payment sheet of the App Store
  func donate(_ product: Product) async -> DonationResult {
    guard !isDonating else { return .failed }
    isDonating = true
    defer { isDonating = false }

    do {
      switch try await storeHelper.purchase(product).purchaseState {
      case .purchased:
        await refreshSubscription()
        return .donated
      case .pending: return .pending
      case .cancelled: return .cancelled
      default: return .failed
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
