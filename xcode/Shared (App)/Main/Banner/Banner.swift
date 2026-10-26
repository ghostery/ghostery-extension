//
//  Banner.swift
//  Ghostery
//
//  Banner at the bottom of the sections, showing its items one after
//  another.
//

import SwiftUI

fileprivate enum Constants {
  static let cornerRadius: CGFloat = 12
  static let shadowRadius: CGFloat = 6
  static let shadowY: CGFloat = 4

  static let itemDuration: TimeInterval = 5
  static let transitionDuration: Double = 0.4
  // No farther than the padding, so items never leave the banner
  static let transitionOffset: CGFloat = 12

  #if os(iOS)
  // Where the item would stop, moving on for this time at the speed of the
  // finger, from where it's let go
  static let swipeMomentum: TimeInterval = 0.2
  // Farther than this, the swipe shows the next or the previous item
  static let swipeDistance: CGFloat = 80
  static let swipeReturnDuration: Double = 0.3
  // Of the slide which goes on after a swipe, starting at the speed of
  // the finger, up to this many times the rest of the way per second
  static let swipeSlideDuration: Double = 0.5
  static let swipeSlideMaxSpeed: Double = 8
  #endif

  static let paginationSpacing: CGFloat = 4
  static let paginationDotSize: CGFloat = 8
  static let paginationCurrentWidth: CGFloat = 32
  // The dots can be clicked a bit above and below them, as they're small
  static let paginationHitPadding: CGFloat = 4
  // Smooth enough for the fill, without redrawing at the full rate of the display
  static let paginationFrameInterval: TimeInterval = 1.0 / 30
}

fileprivate enum Strings {
  // You can translate your strings here
  static func page(_ number: Int, of count: Int) -> String {
    String(localized: "Page \(number) of \(count)", comment: "Dot of the pagination below the banner, for assistive technologies")
  }
}

/// Sizes of the banner, which differ between the Mac, iPhones and iPads
struct BannerLayout: PlatformLayout {
  /// Around the banner
  var margins: CGFloat
  /// Of the banner, which is otherwise as tall as its current item
  var minHeight: CGFloat?
  var padding: CGFloat
  /// Between the image of an item and its texts
  var spacing: CGFloat
  var qrCodeSize: CGFloat
  /// Lines up the QR code with the title, when the button is below the texts
  var qrCodeTopPadding: CGFloat
  var titleStyle: AppTextStyle
  var descriptionStyle: AppTextStyle
  /// Whether the button of the item about other devices is below its texts,
  /// rather than after them
  var isButtonBelowTexts: Bool
  var buttonSize: AppButtonStyle.Size
  /// Around the title of the button, which follows its icon
  var buttonTitlePadding: EdgeInsets
  var paginationTopPadding: CGFloat

  #if os(macOS)
  static let mac = BannerLayout(
    margins: 20,
    // As tall as the notifications, so the banner keeps its height when its
    // items change
    minHeight: 80,
    padding: 12,
    spacing: 12,
    qrCodeSize: 48,
    qrCodeTopPadding: 0,
    titleStyle: .labelL,
    descriptionStyle: .bodyS,
    isButtonBelowTexts: false,
    buttonSize: .regular,
    buttonTitlePadding: EdgeInsets(top: 0, leading: 8, bottom: 0, trailing: 4),
    paginationTopPadding: 8
  )
  #else
  // Within the margins of the section, and as tall as the current item, as the
  // one about other devices is taller than the notifications
  static let phone = BannerLayout(
    margins: 0,
    minHeight: nil,
    padding: 12,
    spacing: 12,
    qrCodeSize: 48,
    qrCodeTopPadding: 4,
    titleStyle: .labelM,
    descriptionStyle: .bodyS,
    isButtonBelowTexts: true,
    buttonSize: .small,
    buttonTitlePadding: EdgeInsets(top: 0, leading: 4, bottom: 0, trailing: 4),
    paginationTopPadding: 8
  )
  static let tablet = BannerLayout(
    margins: 0,
    minHeight: nil,
    padding: 24,
    spacing: 20,
    qrCodeSize: 64,
    qrCodeTopPadding: 0,
    titleStyle: .headlineS,
    descriptionStyle: .bodyL,
    isButtonBelowTexts: true,
    buttonSize: .large,
    buttonTitlePadding: EdgeInsets(top: 0, leading: 8, bottom: 0, trailing: 8),
    paginationTopPadding: 12
  )
  #endif
}

/// Banner showing its items one after another, with their pagination, whose
/// dots show their items when clicked. On iPhones and iPads, the items slide
/// over as pages, which swipes move. The current item stays while the user
/// points at the banner, has it focused or swipes it, and while a dialog
/// covers it.
struct Banner: View {
  @CurrentLayout private var layout: BannerLayout

  // Shared by the banners of all sections, so the banner keeps its item
  // and countdown when the section changes
  private var state: BannerState { .shared }

  @State private var isHovered = false
  #if os(iOS)
  // Of the item, or the pages, which follow the finger
  @State private var swipeOffset: CGFloat = 0
  @State private var isSwiping = false
  @State private var pageWidth: CGFloat = 0
  @AccessibilityFocusState private var accessibilityFocusedPage: Int?
  #endif
  // Whether the items change towards the previous one, so the transition
  // goes the other way
  @State private var isBackward = false
  @FocusState private var isFocused: Bool
  @AccessibilityFocusState private var isAccessibilityFocused: Bool
  @Environment(\.accessibilityReduceMotion) private var reduceMotion
  // Disabled while a dialog covers it
  @Environment(\.isEnabled) private var isEnabled

  private var items: [BannerItem] {
    BannerItem.current
  }

  /// Of the current item, which stays current when the other items change
  private var index: Int {
    items.firstIndex { $0.id == state.itemID } ?? 0
  }

  // Also when the launch arguments of Debug builds choose the item
  private var isPaused: Bool {
    #if os(iOS)
    isHovered || isFocused || isAccessibilityFocused || accessibilityFocusedPage != nil || !isEnabled || isSwiping
      || DebugLaunch.bannerItem != nil
    #else
    isHovered || isFocused || isAccessibilityFocused || !isEnabled || DebugLaunch.bannerItem != nil
    #endif
  }

  var body: some View {
    let shape = RoundedRectangle(cornerRadius: Constants.cornerRadius)
    let layout = self.layout

    VStack(spacing: 0) {
      Group {
        #if os(iOS)
        if reduceMotion {
          currentItem(layout: layout)
        } else {
          pages(layout: layout)
        }
        #else
        currentItem(layout: layout)
        #endif
      }
      .frame(maxWidth: .infinity, minHeight: layout.minHeight)
      #if os(iOS)
      // The item being swiped doesn't leave the banner
      .clipShape(shape)
      .gesture(HorizontalPanGesture(onChanged: swipe(by:), onEnded: endSwipe(translation:velocity:)))
      #endif
      .background(
        shape
          .fill(Colors.bgPrimary)
          .shadow(color: Colors.shadowCard, radius: Constants.shadowRadius, y: Constants.shadowY)
      )
      .overlay(shape.strokeBorder(Colors.borderPrimary, lineWidth: Borders.width))

      if items.count > 1 {
        pagination
          .padding(.top, layout.paginationTopPadding)
      }
    }
    .onHover { isHovered = $0 }
    // Focus on the item, or on the dots of the pagination
    .focused($isFocused)
    .padding(layout.margins)
    .onChange(of: isPaused) {
      if isPaused {
        state.clock.pause()
      } else {
        state.clock.resume()
      }
    }
    // Later changes go forward again, once the transition of a swipe back
    // has its direction
    .onChange(of: state.itemID) { isBackward = false }
    // When the current item is removed, like the invitation to launch at
    // login once it's accepted, the first item takes its place, and is shown
    // for the whole time
    .onChange(of: items.map(\.id)) { oldIDs, newIDs in
      guard let currentID = state.itemID ?? oldIDs.first, !newIDs.contains(currentID) else { return }
      withAnimation(.easeInOut(duration: Constants.transitionDuration)) {
        state.itemID = newIDs.first
        state.clock.restart()
      }
    }
    // Leaves the clock running for the banner of the next section, unless
    // the item is chosen by the launch arguments
    .onDisappear {
      if isPaused && DebugLaunch.bannerItem == nil {
        state.clock.resume()
      }
    }
    .onAppear {
      guard let index = DebugLaunch.bannerItem, items.indices.contains(index) else { return }
      state.itemID = items[index].id
      #if os(iOS)
      state.page = index
      #endif
      state.clock.restart()
      state.clock.pause()
    }
    // Moves to the next item once the current one was shown long enough.
    // It restarts with every change of the clock, so it waits only while
    // the clock runs.
    .task(id: state.clock) {
      guard state.clock.isRunning, items.count > 1 else { return }
      try? await Task.sleep(for: .seconds(max(Constants.itemDuration - state.clock.elapsed(), 0)))
      guard !Task.isCancelled else { return }
      showNext()
    }
  }

  // The current item, which the next one replaces with the transition
  private func currentItem(layout: BannerLayout) -> some View {
    ZStack {
      if !items.isEmpty {
        let item = items[index]

        BannerItemView(item: item, layout: layout)
          #if os(iOS)
          .offset(x: swipeOffset)
          #endif
          .accessibilityFocused($isAccessibilityFocused)
          .id(item.id)
          .transition(transition)
      }
    }
  }

  #if os(iOS)
  // The current item between the previous and the next ones, which follow
  // the swipes, and slide over when the item changes. The pages are
  // numbered on around the items, so the ones next to the current page are
  // always on its sides.
  @ViewBuilder
  private func pages(layout: BannerLayout) -> some View {
    let items = self.items

    if !items.isEmpty {
      BannerPagesLayout(offset: swipeOffset) {
        ForEach(state.page - 1...state.page + 1, id: \.self) { page in
          let position = page - state.page

          BannerItemView(item: items[(page % items.count + items.count) % items.count], layout: layout)
            .layoutValue(key: BannerPagePosition.self, value: position)
            // Only the current item can be used
            .allowsHitTesting(position == 0)
            .accessibilityHidden(position != 0)
            .accessibilityFocused($accessibilityFocusedPage, equals: page)
            .transition(transition)
        }
      }
      .onGeometryChange(for: CGFloat.self) { $0.size.width } action: { pageWidth = $0 }
    }
  }
  #endif

  // The current item leaves in the first half of the transition, and the next
  // one comes in the second, so their texts don't overlap. A removed item
  // keeps the transition it last had, so the direction is set before.
  private var transition: AnyTransition {
    let half = Constants.transitionDuration / 2
    let offset = isBackward ? -Constants.transitionOffset : Constants.transitionOffset
    let insertion: AnyTransition = reduceMotion ? .opacity : .offset(x: offset).combined(with: .opacity)
    let removal: AnyTransition = reduceMotion ? .opacity : .offset(x: -offset).combined(with: .opacity)

    return .asymmetric(
      insertion: insertion.animation(.easeOut(duration: half).delay(half)),
      removal: removal.animation(.easeIn(duration: half))
    )
  }

  private func showNext() {
    show((index + 1) % items.count)
  }

  private func show(_ index: Int) {
    guard index != self.index else { return }
    withAnimation(.easeInOut(duration: Constants.transitionDuration)) {
      move(to: index)
    }
  }

  private func move(to index: Int) {
    let items = self.items
    #if os(iOS)
    // An item next to the current one gets the next or the previous page,
    // so the pages slide over. A further item gets a page apart from them,
    // so it replaces the current one with the transition.
    let step = (index - self.index + items.count) % items.count
    if step == 1, !(isBackward && step == items.count - 1) {
      state.page += 1
    } else if step == items.count - 1 {
      state.page -= 1
    } else {
      state.page += step + 2 * items.count
    }
    // The pages, or the next item, move on from where the swipe left them
    swipeOffset = 0
    #endif
    state.itemID = items[index].id
    state.clock.restart()
  }

  #if os(iOS)
  private func swipe(by translation: CGFloat) {
    guard items.count > 1 else { return }
    isSwiping = true
    // Swiping to the right goes back to the previous item
    isBackward = translation > 0
    swipeOffset = translation
  }

  private func endSwipe(translation: CGFloat, velocity: CGFloat) {
    guard isSwiping else { return }
    isSwiping = false
    let distance = translation + velocity * Constants.swipeMomentum
    if abs(distance) > Constants.swipeDistance, (distance < 0) == (translation < 0) {
      let count = items.count
      let index = distance < 0 ? (self.index + 1) % count : (self.index + count - 1) % count
      if reduceMotion {
        show(index)
      } else {
        // The pages go on at the speed of the finger, so the swipe and the
        // slide are one movement
        let speed = max(distance < 0 ? -velocity : velocity, 0) / max(pageWidth - abs(translation), 1)
        let animation = Animation.interpolatingSpring(
          duration: Constants.swipeSlideDuration,
          initialVelocity: min(speed, Constants.swipeSlideMaxSpeed)
        )
        withAnimation(animation) {
          move(to: index)
        }
      }
    } else {
      withAnimation(.spring(duration: Constants.swipeReturnDuration)) {
        swipeOffset = 0
      }
      isBackward = false
    }
  }
  #endif

  // The current item is longer, and fills up while it's shown. The dots show
  // their items when clicked.
  private var pagination: some View {
    TimelineView(.animation(minimumInterval: Constants.paginationFrameInterval, paused: !state.clock.isRunning)) { context in
      let progress = min(state.clock.elapsed(at: context.date) / Constants.itemDuration, 1)
      let items = self.items
      let index = self.index

      HStack(spacing: 0) {
        ForEach(items.indices, id: \.self) { itemIndex in
          let isCurrent = itemIndex == index

          Button { show(itemIndex) } label: {
            Capsule()
              .fill(Colors.brand300)
              .overlay(alignment: .leading) {
                if isCurrent {
                  Capsule()
                    .fill(Colors.foregroundBrandPrimary)
                    .frame(width: Constants.paginationCurrentWidth * progress)
                }
              }
              .clipShape(Capsule())
              .frame(
                width: isCurrent ? Constants.paginationCurrentWidth : Constants.paginationDotSize,
                height: Constants.paginationDotSize
              )
              // Clickable up to the halves of the spaces between the dots
              .padding(.horizontal, Constants.paginationSpacing / 2)
              .padding(.vertical, Constants.paginationHitPadding)
              .contentShape(Rectangle())
          }
          .buttonStyle(.plain)
          .accessibilityLabel(Strings.page(itemIndex + 1, of: items.count))
          .accessibilityAddTraits(isCurrent ? .isSelected : [])
        }
      }
      // The buttons are taller than the dots, without taking more space
      .padding(.vertical, -Constants.paginationHitPadding)
    }
    .frame(maxWidth: .infinity)
  }
}

/// Item shown by the banner, and for how long
@MainActor
@Observable
private final class BannerState {
  static let shared = BannerState()

  /// Of the current item, or nil for the first one
  var itemID: String?
  /// Of the current item on iPhones and iPads, counted on past the last
  /// item and before the first one
  var page = 0
  var clock = BannerClock()
}

/// Time the current item of a banner is shown for, without the time
/// the banner was paused
private struct BannerClock: Equatable {
  private var elapsedBeforePause: TimeInterval = 0
  /// Since when the clock runs, unless it's paused
  private var runningSince: Date? = .now

  var isRunning: Bool { runningSince != nil }

  func elapsed(at date: Date = .now) -> TimeInterval {
    elapsedBeforePause + max(runningSince.map { date.timeIntervalSince($0) } ?? 0, 0)
  }

  mutating func pause() {
    guard isRunning else { return }
    elapsedBeforePause = elapsed()
    runningSince = nil
  }

  mutating func resume() {
    guard !isRunning else { return }
    runningSince = .now
  }

  /// Starts again from zero, and stays paused if it is
  mutating func restart() {
    elapsedBeforePause = 0
    if isRunning {
      runningSince = .now
    }
  }
}

#Preview {
  Banner()
    #if os(macOS)
    .frame(width: 736)
    #else
    .padding()
    #endif
}
