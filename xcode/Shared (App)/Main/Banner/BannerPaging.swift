//
//  BannerPaging.swift
//  Ghostery
//
//  Pages of the banner on iPhones and iPads, which follow the swipes of the
//  finger.
//

#if os(iOS)
import SwiftUI
import UIKit

/// Pan of the finger sideways. Unlike a drag gesture, it doesn't start when
/// the finger moves up or down, which scrolls the section instead.
struct HorizontalPanGesture: UIGestureRecognizerRepresentable {
  var onChanged: (CGFloat) -> Void
  /// With the translation and the velocity, which are zero when the system
  /// cancels the pan
  var onEnded: (CGFloat, CGFloat) -> Void

  func makeUIGestureRecognizer(context: Context) -> UIPanGestureRecognizer {
    let recognizer = UIPanGestureRecognizer()
    recognizer.delegate = context.coordinator
    return recognizer
  }

  func makeCoordinator(converter: CoordinateSpaceConverter) -> Coordinator {
    Coordinator()
  }

  func handleUIGestureRecognizerAction(_ recognizer: UIPanGestureRecognizer, context: Context) {
    switch recognizer.state {
    case .began, .changed:
      onChanged(recognizer.translation(in: recognizer.view).x)
    case .ended:
      onEnded(recognizer.translation(in: recognizer.view).x, recognizer.velocity(in: recognizer.view).x)
    case .cancelled, .failed:
      onEnded(0, 0)
    default:
      break
    }
  }

  final class Coordinator: NSObject, UIGestureRecognizerDelegate {
    func gestureRecognizerShouldBegin(_ gestureRecognizer: UIGestureRecognizer) -> Bool {
      guard let pan = gestureRecognizer as? UIPanGestureRecognizer else { return true }
      let velocity = pan.velocity(in: pan.view)
      return abs(velocity.x) > abs(velocity.y)
    }
  }
}

/// Position of a page of the banner, from the current one
struct BannerPagePosition: LayoutValueKey {
  static let defaultValue = 0
}

/// Pages of the banner in a row, each as wide as the banner, moved by the
/// swipe. The banner is as tall as the current page.
struct BannerPagesLayout: Layout {
  var offset: CGFloat

  func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
    guard let current = subviews.first(where: { $0[BannerPagePosition.self] == 0 }) else { return .zero }
    let size = current.sizeThatFits(ProposedViewSize(width: proposal.width, height: nil))
    return CGSize(width: proposal.width ?? size.width, height: size.height)
  }

  func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
    for subview in subviews {
      let x = bounds.minX + CGFloat(subview[BannerPagePosition.self]) * bounds.width + offset
      subview.place(at: CGPoint(x: x, y: bounds.minY), proposal: ProposedViewSize(width: bounds.width, height: nil))
    }
  }
}
#endif
