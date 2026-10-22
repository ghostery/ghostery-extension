//
//  QRCode.swift
//  Ghostery
//
//  QR codes of links, drawn in the style of the design.
//

import CoreImage
import CoreImage.CIFilterBuiltins
import SwiftUI

fileprivate enum Constants {
  // In modules, as measured in the design
  static let margin: CGFloat = 2
  static let moduleCornerRadius: CGFloat = 0.34
  static let finderSize = 7
  static let finderCornerRadius: CGFloat = 2.39
  static let finderRingWidth: CGFloat = 1.05
  static let finderDotInset: CGFloat = 2
  static let finderDotCornerRadius: CGFloat = 0.82

  // Of the width of the code, with its margin, for the 53 modules of a link
  // of the app in the design
  static let logoSize: CGFloat = 17 / 57
}

/// QR code of a link, in black on white. A large one has the logo in the
/// middle, and corrects more errors to make up for the modules it covers.
struct QRCodeImage: View {
  let url: URL
  var hasLogo = true

  var body: some View {
    // High, or medium without the logo, as the design
    let matrix = QRCodeMatrix.cached(for: url.absoluteString, correctionLevel: hasLogo ? "H" : "M")

    ZStack {
      Color.white
      if let matrix {
        QRCodeShape(matrix: matrix)
          .fill(Color.black)
      }
      if hasLogo {
        GeometryReader { proxy in
          // The circle of the logo covers the modules below it
          Image(decorative: Icons.qrCodeLogo)
            .resizable()
            .frame(width: proxy.size.width * Constants.logoSize, height: proxy.size.height * Constants.logoSize)
            .position(x: proxy.size.width / 2, y: proxy.size.height / 2)
        }
      }
    }
    .aspectRatio(1, contentMode: .fit)
    .accessibilityElement(children: .ignore)
    .accessibilityAddTraits(.isImage)
  }
}

/// Modules of a QR code, which are dark when they're set
private struct QRCodeMatrix {
  let size: Int
  private let modules: [Bool]

  // The codes are the same for every view of a link
  @MainActor private static var cache: [String: QRCodeMatrix] = [:]

  @MainActor
  static func cached(for message: String, correctionLevel: String) -> QRCodeMatrix? {
    let key = correctionLevel + message
    if let matrix = cache[key] {
      return matrix
    }
    let matrix = QRCodeMatrix(message: message, correctionLevel: correctionLevel)
    cache[key] = matrix
    return matrix
  }

  private init?(message: String, correctionLevel: String) {
    let filter = CIFilter.qrCodeGenerator()
    filter.message = Data(message.utf8)
    filter.correctionLevel = correctionLevel
    guard let image = filter.outputImage else { return nil }

    // A pixel for each module, with a margin of one module around them,
    // which is left out
    let width = Int(image.extent.width)
    var pixels = [UInt8](repeating: 0, count: width * width)
    CIContext().render(image, toBitmap: &pixels, rowBytes: width, bounds: image.extent, format: .L8, colorSpace: nil)

    let size = width - 2
    self.size = size
    modules = (0..<size * size).map { index in
      pixels[(index / size + 1) * width + index % size + 1] < 128
    }
  }

  /// The modules outside of the code are light
  subscript(row: Int, column: Int) -> Bool {
    guard (0..<size).contains(row), (0..<size).contains(column) else { return false }
    return modules[row * size + column]
  }

  /// Rows and columns of the corners of the squares in three corners of the
  /// code, which scanners look for
  var finders: [(row: Int, column: Int)] {
    [(0, 0), (0, size - Constants.finderSize), (size - Constants.finderSize, 0)]
  }

  func isInFinder(row: Int, column: Int) -> Bool {
    finders.contains { finder in
      (finder.row..<finder.row + Constants.finderSize).contains(row)
        && (finder.column..<finder.column + Constants.finderSize).contains(column)
    }
  }
}

/// Dark modules of a QR code, rounded at the corners that don't touch other
/// modules, and the squares in its corners, drawn as rounded squares
private struct QRCodeShape: Shape {
  let matrix: QRCodeMatrix

  func path(in rect: CGRect) -> Path {
    let unit = min(rect.width, rect.height) / (CGFloat(matrix.size) + 2 * Constants.margin)
    let origin = CGPoint(x: rect.minX + Constants.margin * unit, y: rect.minY + Constants.margin * unit)
    func frame(row: Int, column: Int, size: CGFloat = 1) -> CGRect {
      CGRect(x: origin.x + CGFloat(column) * unit, y: origin.y + CGFloat(row) * unit, width: size * unit, height: size * unit)
    }

    var path = Path()
    let radius = Constants.moduleCornerRadius * unit
    for row in 0..<matrix.size {
      for column in 0..<matrix.size where matrix[row, column] && !matrix.isInFinder(row: row, column: column) {
        // A corner is rounded when the modules on both of its sides are light
        func cornerRadius(rowStep: Int, columnStep: Int) -> CGFloat {
          matrix[row + rowStep, column] || matrix[row, column + columnStep] ? 0 : radius
        }
        path.addRoundedRect(
          in: frame(row: row, column: column),
          cornerRadii: RectangleCornerRadii(
            topLeading: cornerRadius(rowStep: -1, columnStep: -1),
            bottomLeading: cornerRadius(rowStep: 1, columnStep: -1),
            bottomTrailing: cornerRadius(rowStep: 1, columnStep: 1),
            topTrailing: cornerRadius(rowStep: -1, columnStep: 1)
          ),
          style: .circular
        )
      }
    }

    for finder in matrix.finders {
      let outer = frame(row: finder.row, column: finder.column, size: CGFloat(Constants.finderSize))
      let ringWidth = Constants.finderRingWidth * unit
      let ring = Path(roundedRect: outer, cornerRadius: Constants.finderCornerRadius * unit)
        .subtracting(Path(roundedRect: outer.insetBy(dx: ringWidth, dy: ringWidth), cornerRadius: Constants.finderCornerRadius * unit - ringWidth))
      path.addPath(ring)

      let dotInset = Constants.finderDotInset * unit
      path.addPath(Path(roundedRect: outer.insetBy(dx: dotInset, dy: dotInset), cornerRadius: Constants.finderDotCornerRadius * unit))
    }
    return path
  }
}

struct QRCodeImage_Previews: PreviewProvider {
  static var previews: some View {
    QRCodeImage(url: URL(string: "https://www.ghostery.com")!)
      .frame(width: 200, height: 200)
  }
}
