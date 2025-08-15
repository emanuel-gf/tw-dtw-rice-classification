Time Weighted Dynamic Time Warping (TW-DTW)

This is a implementation of the TW-DTW to classify paddy rice crops within a Area of Interest (AOI) at southern Brazil.

The algorith was used on GEE in order to post-processing MapBiomas Land Use Land Cover (LULC) 10-m. Which is a Sentinel-2 derived LULC collection.
The focus was applying consistently the TW-DTW that retrieves the time-series features and create a dissimilarity score representing how far the pixel is from the reference pixel samples.

The TW-DTW was implemented by: and outputs two bands: Classification and Score. 

A further analysis on the score was processed in order to fine-tunning the classification and improve the results. The analysis used OTSU thresholding for threshold dissimilarity scores.

TW-DTW relies powerful on a scarce data regions. With only 13 samples I was able to classify rice crops extensively. 
  
## Repository Structure

```bash 
scripts_R
 ┣ Colab
 ┃ ┗ DTW_GEE_python.ipynb # Phenological analysis of temporal rice crops
 ┣ GEE
 ┣ Plots
 ┃ ┣ classicationmap_dtw.png
 ┃ ┣ dissimiliarity_score.png
 ┃ ┣ multitemporal_legend.png
 ┃ ┗ padddy-rice-mapbiomas.jpeg
 ┣ R
 ┃ ┣ barplot.R
 ┃ ┣ barplot2.R
 ┃ ┣ colorbar.R
 ┃ ┣ dtw_score.R
 ┃ ┣ multi_temporal.kra
 ┃ ┗ vis-sits.R
 ┣ Study
 ┃ ┗ Emanuel-TWDTW.pdf
 ┣ .gitignore
 ┣ GIF-NDVI.gif
 ┗ README.md
 ```bash
- R
  | - dtw_score.R ## Create plots for the dissimilarity score
  | - sits.R ## Create the multi-temporal composition plot
- GEE
  - tw-dtw-implementation ## Implementation of the TW-DTW
  - tw-dtw-assessment ## Assessment of the results
  - tw-dtw-post-processing ## OTSU thresholding and connectivity of pixels methods
  - tw-dtw-download ## Management and downloading of the results for plot in R
  - tw-dtw-post-processing-2 ## Plots histograms, multi-temporal compositions
- Colab
|- dtw.ipynb ## Colab notebook integrated with GEE to create backscatter analysis and temporal spectral responses

## Acknowledgements 
- SoilWatch
- 
