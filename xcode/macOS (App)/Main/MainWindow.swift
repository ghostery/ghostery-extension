//
//  MainWindow.swift
//  Ghostery
//
//  Look and behaviour of the main window.
//

import AppKit
import SwiftUI

/// Native frosted background, which blurs what is behind the window.
struct MainWindowBackground: NSViewRepresentable {
  func makeNSView(context: Context) -> NSVisualEffectView {
    let view = NSVisualEffectView()
    // In light mode this material lets about 20% of the blurred backdrop
    // through, the same as the design's 80% white frosted glass
    view.material = .headerView
    view.blendingMode = .behindWindow
    // Stay frosted also when the window is inactive
    view.state = .active
    return view
  }

  func updateNSView(_ nsView: NSVisualEffectView, context: Context) {}
}

/// Gives the hosting window a tall, transparent title bar, so the content can
/// draw its own header under the traffic lights.
struct MainWindowConfigurator: NSViewRepresentable {
  /// Size of the window on the first launch
  var size: CGSize

  /// Height of the configured title bar, which SwiftUI adds to the window size.
  /// Measured on a template window, so it's known before the first layout.
  static let titleBarHeight: CGFloat = {
    let window = NSWindow(
      contentRect: NSRect(x: 0, y: 0, width: 100, height: 100),
      styleMask: [.titled, .closable, .miniaturizable, .resizable],
      backing: .buffered,
      defer: true
    )
    configure(window)
    return window.frame.height - window.contentLayoutRect.height
  }()

  private static func configure(_ window: NSWindow) {
    window.titleVisibility = .hidden
    window.titlebarAppearsTransparent = true
    window.titlebarSeparatorStyle = .none
    window.styleMask.insert(.fullSizeContentView)
    window.isMovableByWindowBackground = true
    // An empty unified toolbar makes the title bar as tall as the design's
    // header and vertically centers the traffic lights within it.
    if window.toolbar == nil {
      window.toolbar = NSToolbar(identifier: "MainToolbar")
    }
    window.toolbarStyle = .unified
  }

  func makeNSView(context: Context) -> NSView {
    WindowObservingView(size: size)
  }

  func updateNSView(_ nsView: NSView, context: Context) {}

  private final class WindowObservingView: NSView {
    let size: CGSize
    private weak var configuredWindow: NSWindow?

    init(size: CGSize) {
      self.size = size
      super.init(frame: .zero)
    }

    required init?(coder: NSCoder) {
      fatalError("init(coder:) has not been implemented")
    }

    override func viewDidMoveToWindow() {
      super.viewDidMoveToWindow()
      guard let window, window !== configuredWindow else { return }
      configuredWindow = window
      MainWindowConfigurator.configure(window)

      // SwiftUI fits the window to its content only after placing it on the
      // screen, so apply the default size now to get it centered on the first
      // launch (later launches restore the last frame). The content view
      // covers the whole window, so its size is the window size.
      window.setContentSize(size)
    }
  }
}
