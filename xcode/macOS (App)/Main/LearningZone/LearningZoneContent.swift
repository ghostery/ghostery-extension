//
//  LearningZoneContent.swift
//  Ghostery
//
//  Content of the Learning Zone fetched from ghostery.com: the latest
//  edition of the Privacy Digest, and the latest blog post.
//

import AppKit
import Observation
import os

fileprivate enum Constants {
  static let digestEditionsURL = URL(string: "https://www.ghostery.com/privacy-digest/editions.json")!
  static let latestBlogPostURL = URL(string: "https://www.ghostery.com/blog/latest.json")!
  static let requestTimeout: TimeInterval = 15
  static let resourceTimeout: TimeInterval = 30
  // How long a fetched item is shown before it's fetched again
  static let refreshInterval: TimeInterval = 60 * 60
}

/// Edition of the Privacy Digest, with its cover image
struct PrivacyDigestEdition {
  let displayName: String
  let publishedAt: Date
  let tags: [String]
  let url: URL
  let image: NSImage
}

/// Post of the Ghostery Blog, with its image
struct BlogPost {
  let title: String
  let description: String?
  let category: String?
  let publishedAt: Date
  let url: URL
  let image: NSImage
}

/// Items of the Learning Zone, fetched with their images. Anything wrong with
/// an item or its image leaves the item out, so its card isn't shown rather
/// than shown broken.
enum LearningZoneContent {
  static let digestEdition = FetchedItem("the latest Privacy Digest", fetch: fetchLatestDigestEdition)
  static let blogPost = FetchedItem("the latest blog post", fetch: fetchLatestBlogPost)

  /// Fetches the items which weren't fetched recently
  @MainActor
  static func refresh() async {
    async let digestEditionRefresh: Void = digestEdition.refresh()
    async let blogPostRefresh: Void = blogPost.refresh()
    _ = await (digestEditionRefresh, blogPostRefresh)
  }

  static let logger = Logger(subsystem: Bundle.main.bundleIdentifier ?? "Ghostery", category: "LearningZone")

  private static func fetchLatestDigestEdition() async throws -> PrivacyDigestEdition {
    // Editions are listed newest first, also the scheduled ones, which
    // aren't sent yet. One that can't be read doesn't fail the others.
    let editions = try await fetchJSON([Lossy<EditionData>].self, from: Constants.digestEditionsURL).compactMap(\.value)
    guard let edition = editions.first(where: { $0.publishedAt <= .now }) else {
      throw LearningZoneError.noItem
    }

    let displayName = edition.displayName.trimmed
    guard !displayName.isEmpty, edition.url.scheme == "https" else {
      throw LearningZoneError.invalidItem
    }

    return PrivacyDigestEdition(
      displayName: displayName,
      publishedAt: edition.publishedAt,
      tags: (edition.tags ?? []).map(\.trimmed).filter { !$0.isEmpty },
      url: edition.url,
      image: try await fetchImage(from: edition.imageUrl)
    )
  }

  private static func fetchLatestBlogPost() async throws -> BlogPost {
    let post = try await fetchJSON(BlogPostData.self, from: Constants.latestBlogPostURL)

    let title = post.title.trimmed
    guard !title.isEmpty, post.url.scheme == "https" else {
      throw LearningZoneError.invalidItem
    }

    return BlogPost(
      title: title,
      description: post.description?.trimmed.nonEmpty,
      category: post.category?.trimmed.nonEmpty,
      publishedAt: post.publishedAt,
      url: post.url,
      image: try await fetchImage(from: post.imageUrl)
    )
  }

  // Nothing about the requests is kept on disk, and no cookies are sent
  private static let session: URLSession = {
    let configuration = URLSessionConfiguration.ephemeral
    configuration.timeoutIntervalForRequest = Constants.requestTimeout
    configuration.timeoutIntervalForResource = Constants.resourceTimeout
    configuration.httpCookieAcceptPolicy = .never
    configuration.httpShouldSetCookies = false
    return URLSession(configuration: configuration)
  }()

  private static func fetchJSON<Value: Decodable>(_ type: Value.Type, from url: URL) async throws -> Value {
    let (data, response) = try await session.data(from: url)
    try validate(response, contentType: "application/json")

    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .convertFromSnakeCase
    decoder.dateDecodingStrategy = .iso8601
    return try decoder.decode(type, from: data)
  }

  private static func fetchImage(from url: URL?) async throws -> NSImage {
    guard let url, url.scheme == "https" else {
      throw LearningZoneError.invalidItem
    }

    let (data, response) = try await session.data(from: url)
    try validate(response, contentType: "image/")
    guard let image = NSImage(data: data), image.isValid, image.size.width > 0, image.size.height > 0 else {
      throw LearningZoneError.invalidImage
    }
    return image
  }

  private static func validate(_ response: URLResponse, contentType: String) throws {
    guard let response = response as? HTTPURLResponse, response.statusCode == 200 else {
      throw LearningZoneError.badResponse
    }
    guard response.mimeType?.hasPrefix(contentType) == true else {
      throw LearningZoneError.badContentType
    }
  }
}

/// Item fetched from ghostery.com, which is nil until it's fetched
@Observable
final class FetchedItem<Value> {
  private(set) var value: Value?

  @ObservationIgnored private let name: String
  @ObservationIgnored private let fetch: () async throws -> Value
  @ObservationIgnored private var fetchedAt: Date?
  @ObservationIgnored private var isFetching = false

  init(_ name: String, fetch: @escaping () async throws -> Value) {
    self.name = name
    self.fetch = fetch
  }

  /// Fetches the item, unless it was fetched recently
  @MainActor
  func refresh() async {
    if let fetchedAt, Date.now.timeIntervalSince(fetchedAt) < Constants.refreshInterval { return }
    guard !isFetching else { return }

    isFetching = true
    defer { isFetching = false }

    do {
      value = try await fetch()
      fetchedAt = .now
    } catch {
      // A failed refresh keeps the item fetched before, if there is one
      LearningZoneContent.logger.error("Fetching \(self.name, privacy: .public) failed: \(String(describing: error), privacy: .public)")
    }
  }
}

private enum LearningZoneError: Error {
  case badResponse
  case badContentType
  case noItem
  case invalidItem
  case invalidImage
}

/// Edition as listed by ghostery.com/privacy-digest/editions.json
private struct EditionData: Decodable {
  let displayName: String
  let publishedAt: Date
  let tags: [String]?
  let imageUrl: URL?
  let url: URL
}

/// Post as given by ghostery.com/blog/latest.json
private struct BlogPostData: Decodable {
  let title: String
  let description: String?
  let category: String?
  let publishedAt: Date
  let imageUrl: URL?
  let url: URL
}

/// Decodes to nil instead of failing
private struct Lossy<Value: Decodable>: Decodable {
  let value: Value?

  init(from decoder: Decoder) throws {
    value = try? Value(from: decoder)
  }
}

fileprivate extension String {
  var trimmed: String {
    trimmingCharacters(in: .whitespacesAndNewlines)
  }

  /// The string, or nil when it's empty
  var nonEmpty: String? {
    isEmpty ? nil : self
  }
}
