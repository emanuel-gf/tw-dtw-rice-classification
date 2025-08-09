# Beautiful Horizontal Bar Plot for Land Use Data
# Load required libraries
library(ggplot2)
library(tidyverse)
library(scales)

# Create the dataset
df <- data.frame(
  category = c("Rice", "Other Crops", "Pasture", "Forest Plantation",
               "Urban", "Herbaceous Vegetation", "Forest", "Water"),
  percentage = c(18.50, 26.87, 6.78, 5.17,
                 5.68, 2.47, 32.76, 1.77),
  area = c(9029824, 13114264, 3311433, 2520840,
           2770703, 1205720, 15988618, 864702)
)

df <- df |> mutate(
  area_m2 = area*100,
  area_km2 = round(area_m2/1000000,0),
  # Create alpha values: 1.0 for Rice, 0.6 for others
  alpha_values = ifelse(category == "Rice", 1.0, 0.5),
  # Create font face values: bold for Rice, normal for others
  font_face = ifelse(category == "Rice", "bold", "normal")
)

# Arrange by percentage (largest to smallest) and reorder factor levels
df <- df %>%
  arrange(percentage) %>%  # Ascending for horizontal bars (largest at top)
  mutate(category = factor(category, levels = category))

# Define beautiful colors for each category
colors <- c("#4682B4", "#DDA0DD", "#CD853F", "RED",
            "#FFD700", "#2E8B57", "#228B22", "#006400")

# Create the horizontal bar plot
horizontal_plot <- ggplot(df, aes(x = percentage, y = category, fill = category)) +
  geom_col(width = 0.7, color = "white", size = 0.5,
           aes(alpha = alpha_values)) +  # Use alpha aesthetic mapped to alpha_values

  # Manually set alpha values to avoid legend
  scale_alpha_identity() +

  # Add percentage labels on the bars
  geom_text(aes(label = paste0(round(percentage, 1), "%")),
            hjust = -0.1, vjust = 0.5,
            color = "black", fontface = "bold", size = 4) +

  # Add area labels inside bars (for larger bars)
  geom_text(aes(label = ifelse(percentage > 6,
                               paste0(format(area_km2)," km²"), "")),
            hjust = 1.05, vjust = 0.5,
            color = "white", fontface = "bold", size = 3.5) +

  # Customize colors
  scale_fill_manual(values = colors, guide = "none") +

  # Customize x-axis
  scale_x_continuous(limits = c(0, max(df$percentage) * 1.15),
                     breaks = seq(0, 35, 5),
                     labels = function(x) paste0(x, "%")) +

  # Add vertical reference lines
  geom_vline(xintercept = c(10, 20, 30), color = "grey80", linetype = "dashed", alpha = 0.7) +

  # Customize theme
  theme_minimal() +
  theme(
    plot.title = element_text(hjust = 0.5, size = 18, face = "bold",
                              margin = margin(b = 20)),
    plot.subtitle = element_text(hjust = 0.5, size = 12, color = "gray40",
                                 margin = margin(b = 20)),
    axis.title.x = element_text(size = 12, face = "bold"),
    axis.title.y = element_text(size = 12, face = "bold"),
    axis.text.x = element_text(size = 10),
    axis.text.y = element_text(size = 11, face = "bold"),
    panel.grid.major.y = element_blank(),
    panel.grid.minor = element_blank(),
    panel.grid.major.x = element_line(color = "grey90", size = 0.3),
    plot.background = element_rect(fill = "white", color = NA),
    panel.background = element_rect(fill = "white", color = NA),
    plot.margin = margin(20, 20, 20, 20)
  ) +

  # Add labels
  labs(
    title = "MAPBIOMAS - Land Use and Land Cover",
    x = "",
    y = "Land Use",
    caption = paste("Total Area:", sum(df$area_km2), "Km²","\n","2020 - Collection 2 (Beta)  Sentinel-2")
  )

# Display the plot
print(horizontal_plot)

# Optional: Save the plot
# ggsave("horizontal_landuse_plot.png", horizontal_plot, width = 12, height = 8, dpi = 300, bg = "white")

# Print summary statistics
cat("\n=== LAND USE SUMMARY ===\n")
land_use_summary <- df %>%
  arrange(desc(percentage)) %>%
  select(category, area, percentage)

print(land_use_summary)
