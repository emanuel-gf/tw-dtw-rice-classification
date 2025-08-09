library(RStoolbox)
library(terra)
library(magick)
library(stringr)

## Utils function
natural_sort_stringr <- function(x) {
  # Extract numbers after "ndvi_" or set to 0 for just "ndvi"
  numbers <- str_extract(x, "(?<=ndvi_)\\d+")
  numbers <- as.numeric(numbers)
  numbers[is.na(numbers)] <- 0  # For "ndvi.png" without underscore
  x[order(numbers)]
}



## import dataset
rast1 <- terra::rast("D:/Desktop/COPERNICUS/Classes/2-Semester/Analysis_Modelling/results/SITS/ras1.tif")
rast2 <- terra::rast("D:/Desktop/COPERNICUS/Classes/2-Semester/Analysis_Modelling/results/SITS/ras2.tif")
rast3 <- terra::rast("D:/Desktop/COPERNICUS/Classes/2-Semester/Analysis_Modelling/results/SITS/ras3.tif")
rast4 <- terra::rast("D:/Desktop/COPERNICUS/Classes/2-Semester/Analysis_Modelling/results/SITS/ras4.tif")
rast5 <- terra::rast("D:/Desktop/COPERNICUS/Classes/2-Semester/Analysis_Modelling/results/SITS/ras5.tif")
rast6 <- terra::rast("D:/Desktop/COPERNICUS/Classes/2-Semester/Analysis_Modelling/results/SITS/rast6.tif")
rast7 <- terra::rast("D:/Desktop/COPERNICUS/Classes/2-Semester/Analysis_Modelling/results/SITS/rast7.tif")
rast8 <- terra::rast("D:/Desktop/COPERNICUS/Classes/2-Semester/Analysis_Modelling/results/SITS/rast8.tif")

vec_rasters <- c(rast1,rast2,rast3,rast4,rast5)
select_bands <- c("ndvi"   , "ndvi_1" , "ndvi_2",  "ndvi_3" , "ndvi_4",  "ndvi_5" , "ndvi_6",  "ndvi_7",
                  "ndvi_8",  "ndvi_9",
                 "ndvi_10", "ndvi_11")

## Create a mosaic
raster <- mosaic(rast1[select_bands],rast2[select_bands],rast3[select_bands],rast4[select_bands],rast5[select_bands],
                 rast6[select_bands],rast7[select_bands],rast8[select_bands])


## Save the raster
writeRaster(raster,
             "results/mosaic_sits_full.tif")
#3 ------------------------------------------------------------------
## Clean the workspace and load it back the raster
full_raster <- rast("D:/Desktop/COPERNICUS/Classes/2-Semester/Analysis_Modelling/results/mosaic_sits_full.tif")

masked_full_raster <-
## downscale the raster to go with quicker plots
downsample <- full_raster |> aggregate(fact=2, fun='median')
downsample_norm <- (downsample/10000) |> rescaleImage(ymin=-1,ymax=1)

## try a mask approach
msk <-  ifel(downsample<0, -1, downsample)
msk_norm_raster <- (msk/10000) |> rescaleImage(ymin=-1, ymax=1)


## Rescale between 0 -1
norm_raster <- (downsample/10000) |> rescaleImage(ymin=-1, ymax=1)

## ----------------------------------------------------------------
## Plot to test
norm_raster[["ndvi"]] |> plot(type="continuous",
                              col = terra.pal("RdYlGn",10),
                              axes=FALSE,
                              box=FALSE,
                              mar=c(2.1, 4.1, 2.1, 8.1),
                              legend="bottomright"
                              )

my_palette <- colorRampPalette(brewer.pal(11, "RdYlGn"))(100)
custom_palette <- c("#FFFFF0", my_palette)
downsample_norm[["ndvi"]] |> plot(type="continuous",
                              col = custom_palette,
                              axes=FALSE,
                              box=FALSE,
                              mar=c(3.1, 4.1, 2.1, 10.1),
                              legend="bottomright"
)

msk[["ndvi"]] |> plot(type="continuous",
                                  col = custom_palette,
                                  axes=FALSE,
                                  box=FALSE,
                                  mar=c(3.1, 4.1, 2.1, 10.1),
                                  legend="bottomright"
)
msk_norm_raster[["ndvi"]] |> plot(type="continuous",
                      col = custom_palette,
                      axes=FALSE,
                      box=FALSE,
                      mar=c(3.1, 4.1, 2.1, 10.1),
                      legend="bottomright"
)
msk_norm_raster[["ndvi"]] |> plot(type="continuous",
                                  col = custom_palette,
                                  axes=FALSE,
                                  box=FALSE,
                                  mar=c(.5, 2.1, .5, 2.1),
                                  legend=FALSE,
                                  background="#cfe096"
)
## ---------------------------------------------------------
## create a loop for the png image of NDVI
vector_list <- c("ndvi"   , "ndvi_1" , "ndvi_2",  "ndvi_3" , "ndvi_4",  "ndvi_5" , "ndvi_6",  "ndvi_7",
                 "ndvi_8",  "ndvi_9",
               "ndvi_10", "ndvi_11")

my_palette <- colorRampPalette(brewer.pal(11, "RdYlGn"))(100)
custom_palette <- c("#FFFFF0", my_palette)

for (monthly_rast in vector_list) {
  name_rast <- paste0("results/3img_rast_", monthly_rast, ".png")

  png(name_rast, width = 500, height = 600
                )

  plot(msk_norm_raster[[monthly_rast]],
       box = FALSE,
       type = "continuous",
       col = custom_palette,
       axes = FALSE,
       buffer=TRUE,
       mar=c(.5, 2.1, .5, 2.1),
       legend=FALSE,
       background="#cfe096"
  )

  dev.off()
}

## -----------------------------------------------
# Create a colorbar
draw_colorbar <- function(lut, min = -1, max = 1, nticks = 11, title = '') {
  scale <- (length(lut) - 1) / (max - min)

  # Open PNG with narrow width and transparent background
  png("results/slim_colorbar4.png", width = 120, height = 600, bg = "#cfe096", res = 100)

  # Set up empty plot with controlled width
  par(mar = c(2, 1, 2, 4))
  plot(c(0, 1), c(min, max), type = 'n', bty = 'n',
       xaxt = 'n', xlab = '', yaxt = 'n', ylab = '', main = title)

  # Add y-axis
  ticks <- seq(min, max, length.out = nticks)
  axis(4, at = ticks, las = 1)

  # Draw the color blocks
  for (i in 1:(length(lut) - 1)) {
    y <- (i - 1) / scale + min
    rect(0, y, 0.5, y + 1 / scale, col = lut[i], border = NA)
  }

  dev.off()
}


# Call the function
draw_colorbar(my_palette, min = -1, max = 1, nticks = 5, title = "")


## --------------------------------------------------------
# Create a nice rectangle
rec <- image_blank(width = 10, height= 10, color="#FFFFF0",b)
image_write(rec, "results/rec_simple.png")


## -------------------------------------------------------
## Add the colorbar in each image, also add a date
image <-  image_read("results/2img_rast_ndvi_1.png")
colorbar <-image_read("results/slim_colorbar4.png")
rec <- image_read("results/rec_simple.png")

vector_month <- c("JAN-2020", "FEB-2020", "MAR-2020", "APR-2000",
                  "MAY-2020","JUN-2020","JUL-2020","AUG-2020",
                  "SEP-2020",
                  "OCT-2020","NOV-2020","DEZ-2020")

vector_file <- list.files(path = "results/PLOTS/", pattern = "\\.png$", full.names = TRUE)

## Sort by date ndvi=jan, ndvi_1=feb ...
sorted_vector4 <- natural_sort_stringr(vector_file)
print("Method 4 - stringr approach:")
print(sorted_vector4)
## Composite
composite <- image_composite(image_border(image, "", "50x10"),
                             image_crop(image_background(image_resize(colorbar,"150x470"),
                                                        "#cfe096")
                                        ,"150x406+0+32"),
                             offset="+510-107")
composite

#3 Crop image
box_around <- image_border(image_crop(image_trim(composite),"598x618+5+2"),
                          "#000", "2x2")

## Include Month Annotation
annotated <- image_annotate(box_around, "JAN/2020", size = 14, color = "black",
                           # boxcolor = "white",
                            location = "+10+200")

## Include TITLE
annotated2 <- image_annotate(annotated, "NDVI - Farming Fields - LULC", size=15, color="black",
                              location = "+10+10")

## Set LEGEND
annotated3 <- image_annotate(image_composite(annotated2,
                                                    image_border(rec,
                                                                 "black",
                                                                 "1x1"),
                                                    offset="+280+380"),

                             "Masked Values",
                             size=9,
                             locatio='+295+381')
annotated3


## -----------------------------------------------------
## AAPLY FUNCTION CREATING IMAGES

mapply(function(myfile, month) {
  image <- image_read(myfile)
  composite <- image_composite(image_border(image, "", "50x10"),
                               image_crop(image_background(image_resize(colorbar,"150x470"),
                                                           "#cfe096"
                               ),
                               "150x406+0+32"
                               ),
                               offset="+510-107"
  )
  # Crop image
  box_around <- image_border(image_crop(image_trim(composite),"598x618+5+2"),
                             "#000", "2x2")

  ## Include Month Annotation
  annotated <- image_annotate(box_around, month, size = 14, color = "black",
                              # boxcolor = "white",
                              location = "+10+200")

  ## Include TITLE
  annotated2 <- image_annotate(annotated, "NDVI - Farming Fields - LULC", size=15,
                               color="black",
                               location = "+10+10"
  )

  ## Set LEGEND
  annotated3 <- image_annotate(image_composite(annotated2,
                                               image_border(rec,  # Make sure 'rec' is defined
                                                            "black",
                                                            "1x1"
                                               ),
                                               offset="+280+380"
  ),
  "Masked Values",
  size=9,
  location='+295+381'  # Fixed: was 'locatio'
  )

  # Fixed: variable name and function
  image_write(annotated3,  # Changed from 'append' to 'annotated3'
              paste0("results/PLOTS/READY/",month,".png")  # Fixed: was 'past0'
  )
}, sorted_vector4, vector_month
)

## --------------------------------------------------
## CREATE GIF
vector_gif <- list.files(path = "results/PLOTS/READY/", pattern = "\\.png$", full.names = TRUE)

## Sort vector
month_order <- c("JAN", "FEB", "MAR", "APR", "MAY", "JUN",
                 "JUL", "AUG", "SEP", "OCT", "NOV", "DEZ")

sort_by_month <- function(file_vector) {
  # Extract month from filename
  months <- gsub(".*/(\\w{3})-\\d{4}\\.png", "\\1", file_vector)

  # Create a factor with the correct month order
  month_factor <- factor(months, levels = month_order)

  # Sort files by month order
  file_vector[order(month_factor)]
}

vector_gif_sorted <- sort_by_month(vector_gif)


## create the gif
gifski::gifski(
  vector_gif_sorted,
  loop = T,
  delay = .8,
  width = 800,
  height = 700,
  gif_file = "results/PLOTS/READY/2GIF-NDVI.gif"
)



## create the RGB plot

# Plot with your desired band assignment
rescaled_full_raster <- full_raster |> rescaleImage(ymin=0,ymax=255)


## save raster
png("results/multi_temporal_raster.png", width = 600, height = 600)
rescaled_full_raster |> plotRGB(
                                r=3,
                                g=1,
                                b=6,
                                stretch = "lin"
                               )
dev.off()



## -------------------------------------------------------------
## Plot Rice Results from the TW-DTW Analysis
rice_results <- rast("results/DT-TWD-20250718T115526Z-1-001/DT-TWD/DTW_2020_binary_rice_score_class_32722.tif")
rice_results_score <- rast("results/DT-TWD-20250718T115526Z-1-001/DT-TWD/DTW_2020_rice_score.tif")
plot(rice_results)
plot(rice_results_score)

## add title and legend
composite_dtw_score <- image_read("results/score_dtw.png") |>
                              image_border(color="white",
                                           geometry="20x20") |>
                        image_annotate("TW-DTW SCORE",
                                       location = "+200+10",
                                       size=32,
                                       font="Arial") |>
                        image_annotate("DTW Distance",
                                       degrees=-90,
                                       location="+630+290",
                                       size=15,
                                       font="Arial",
                                       color="black") |>
                        image_write("results/score_dtw_legend.png")
composite_dtw_score

mask_hist <- ifel((rice_results_score>1),rice_results_score,FALSE)
hist(mask_hist,
     maxcell=100000000,
     main="DTW SCORE"
     )
