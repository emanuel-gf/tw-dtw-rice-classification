### dissimilarity score

library(terra)

rast1 <- rast("D:/Desktop/COPERNICUS/Classes/2-Semester/Analysis_Modelling/results/DTW/DTW_2020_rice_score.tif")
rast_mask <- rast("D:/Desktop/COPERNICUS/Classes/2-Semester/Analysis_Modelling/results/DTW/DTW_2020_binary_rice_score_class_32722.tif")
mask_lulc <- rast( "D:/Desktop/COPERNICUS/Classes/2-Semester/Analysis_Modelling/results/lulc/LULC_remaped_masked_agrilc_32722.tif")

## Match
mask_lulc <- resample(mask_lulc, rast_mask, method = "near")

## Exclude non agrilcultural fields
test_agric_fields <- ifel(mask_lulc[c("remapped")]==18,rast_mask,NA)
names(test_agric_fields) <- c("classification","dtw_score")
## Export raster masked by LULC
writeRaster(test_agric_fields,
      "D:/Desktop/COPERNICUS/Classes/2-Semester/Analysis_Modelling/results/DTW/dtw_masked2.tif")

select_classification <- test_agric_fields[c("classification")]
writeRaster(select_classification,
            "D:/Desktop/COPERNICUS/Classes/2-Semester/Analysis_Modelling/results/DTW/dtw_single_classification.tif")

thre_otsu <- ifel(test_agric_fields[c("dtw_score")]<24958,test_agric_fields,NA)
single_otsu <- thre_otsu[c("lyr1")]
writeRaster(single_otsu,
            "D:/Desktop/COPERNICUS/Classes/2-Semester/Analysis_Modelling/results/DTW/otsu_single_band.tif")


arbitrary_ <- ifel(test_agric_fields[c("dtw_score")]<33000,test_agric_fields,NA)
single_33 <- arbitrary_[c("lyr1")]
writeRaster(single_33,
            "D:/Desktop/COPERNICUS/Classes/2-Semester/Analysis_Modelling/results/DTW/33_single_band.tif")

## import lulc irrgat and extract one layer
mask_lulc <- rast( "D:/Desktop/COPERNICUS/Classes/2-Semester/Analysis_Modelling/results/lulc/MAPBIOMAS-IRRIGAT-32722.tif")
irigat_2020 <- mask_lulc[c("irrigated_agriculture_2020")]
writeRaster(irigat_2020,
            "D:/Desktop/COPERNICUS/Classes/2-Semester/Analysis_Modelling/results/lulc/irrigat_band.tif")

## mask
rice_ifel <- ifel(test_agric_fields[c("classification")]==1,
                  test_agric_fields,
                  NA
                  )
non_rice_ifel <- ifel(test_agric_fields[c("classification")]==2, test_agric_fields, NA)

names(rice_ifel) <- c("classification","dtw_score")
names(non_rice_ifel) <- c("classification","dtw_score")
plot(rice_ifel)


## Try to create a plot with ggplot
df_rice <- as.data.frame(
  rice_ifel[c("dtw_score")], xy=TRUE
) |> na.omit()


df_non_rice <- as.data.frame(
  non_rice_ifel[c("dtw_score")], xy=TRUE
) |> na.omit()




## Try to plot both together
df_rice$panel <- "rice"
df_non_rice$panel <- "non_rice"
df_combined <- rbind(df_rice, df_non_rice)

panel_labels <- c(
  rice = "Rice",
  non_rice = "Non Rice"
)

ggmap <- ggplot() +
  geom_tile(data = df_combined, aes(x = x, y = y, fill = dtw_score)) +  # changed here
  scale_fill_viridis_c(option='plasma', name='score') +
  facet_wrap(~panel, ncol = 2, labeller = labeller(panel = panel_labels)) +
  coord_equal() +
  theme_void() +
  ggtitle('Dissimilarity Score') +
  theme(
    legend.position = "bottom",
    plot.title = element_text(hjust = 0.5, size = 14, face = "bold")
  )

ggmap


## plot the classification
rice_nonrice_ifel <- ifel((test_agric_fields[c("classification")]==1) | (test_agric_fields[c("classification")]==2),
                          test_agric_fields,
                          NA
)
names(rice_nonrice_ifel) <- c("TWDTW Classification","SCORE")
rice_nonrice_ifel[c("TWDTW Classification")] |> plot(
     axes=FALSE,
     box=FALSE,
     #legend="bottomright"
)

# Create custom levels and labels
levels(rice_nonrice_ifel[["TWDTW Classification"]]) <- data.frame(
  ID = c(1, 2),
  category = c("rice", "non rice")
)

# Plot with title
rice_nonrice_ifel[c("TWDTW Classification")] |> plot(
  axes = FALSE,
  box = FALSE,
  main = "Rice Classification Map",  # Add title here
  #legend = "bottomright"
)
