library(RColorBrewer)

# Create palette with masked color first
my_palette <- colorRampPalette(brewer.pal(11, "RdYlGn"))(100)
custom_palette <- c("#FFFFF0", my_palette)

# Function to draw colorbar with clearly visible "Masked Values" label
draw_colorbar <- function(lut, min = -1, max = 1, nticks = 11, title = '') {
  scale <- (length(lut) - 1) / (max - min)

  # Open PNG with more height and transparent background
  png("results/slim_colorbar_annotated.png", width = 160, height = 750, bg = "transparent", res = 100)

  # Set larger bottom margin to give space for label
  par(mar = c(8, 1, 2, 4))  # bottom, left, top, right

  # Empty plot with extra space below for legend
  plot(c(0, 1), c(min - 0.7, max), type = 'n', bty = 'n',
       xaxt = 'n', xlab = '', yaxt = 'n', ylab = '', main = title)

  # Add y-axis
  ticks <- seq(min, max, length.out = nticks)
  axis(4, at = ticks, las = 1)

  # Draw the colorbar
  for (i in 1:(length(lut) - 1)) {
    y <- (i - 1) / scale + min
    rect(0, y, 0.3, y + 1 / scale, col = lut[i], border = NA)
  }

  # Add swatch for "Masked Values"
  swatch_col <- "#cfe096"
  swatch_y_bottom <- min - 0.6
  swatch_y_top <- min - 0.5
  rect(xleft = 0, ybottom = swatch_y_bottom, xright = 0.2, ytop = swatch_y_top,
       col = swatch_col, border = "#999999")

  # Add readable label next to swatch
  text(x = 0.25, y = (swatch_y_bottom + swatch_y_top) / 2,
       labels = "Masked Values", adj = 0, cex = 0.85, col = "#333333")

  dev.off()
}

# Run the function
draw_colorbar(custom_palette, min = -1, max = 1, nticks = 5)
