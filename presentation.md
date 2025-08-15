# A Time-Weighted Dynamic Time Warping Approach for post-processing Paddy Rice Fields from MapBiomas' Land use Land Cover

# Time-Weighted Dynamic Time Warping Approach for classifying Paddy Rice crops
### MAPBIOMAS

MapBiomas is multi-institutional networking providing annual land use land cover (LULC) datasets and monitor changes in the territory, mainly for Brazil. The collection 8 released in 2022 made it available a land use mapping of Irrigated Agriculture, classifying irrigation rice crops (paddy rice) in partnership with Brazil Water Agency and Embrapa. The cited collection has as a product a classification layer and generates the rice area estimative of annual composition. 
For the Irrigated Collection, the approach was based on Deep Learning methods and so on, Unet architecture. Which have been at the SOTA models for image classification, segmentation and other tasks. However, usually DL models, especially for the Earth Observation field, demands many 

### Paddy Rice Fields


I stabled upon dynamic time warping during a lecture on Earth Observation. Apparently a few lads  and timing variability of normal speech developt the concept, Empowering the comparing simmmetry of temporal series. DTW  spread throughout fields, including remote sensing. So the task was to analyse a case study envolving the given theme. 
Here a case study of DTW for paddy rice classification on Google Earth Engine

Paddy Rice  
### Setting the Scene: Brazil's rice Heartland 

I was raised an born in the little city contourned by the sea and facing the river, a tipping (exutorio) of a big basin. Most of the river swimming I did it was on the companies of paddy rice fields, which extent from the whole area and it is normal the paddy rice fields following the river channel distribution. Perhaps from the land is hard to estimate the extension of the fields, but looking from above make it doable to estimate.

[foto da figueira]

By showing up on my mostly weekly swimming, the seasons starts clearing its patterns, as a showing of seasonality that I was capturing. sometimes the rice is purely green, covering the parcels as grassland, sometimes full of (lamina d'agua) and birds enjoying the (perene) wetlands, other time only barely barren soil. This timing coming from each season and the crops created as a temporal pattern is a purchasing dream of DTW. After a few evolving of the algorithm, (Mals et. al, 2016) argues that DTW is not suited per se for remote sensing, because it disregards the temporal range when finding the best alignment between two time series. The assumption, implemented a time weighted parcel of weights to include seasonality. 

### Setting the Scene: Brazil's rice Heartland 

Souther Brazil is the biggest products of rice in Brazil. Araranguá region of Santa Catarina, southern Brazil, a landscape where emerald rice paddies stretch along meandering rivers, creating a mosaic of agriculture and nature. This 48,814 square kilometer region represents more than just farmland; it's an economic lifeline where rice cultivation accounts for 41% of all agricultural activity.


Perhaps what makes this region particularly interesting is its diversity. A ruggy landscape transition from mountainous plato in the west, where banana plantations cascade down hillsides, to flat coastal plains where rice paddies dominate the river valleys. Urban centers not too big tho, biggest city of Criciuma with 200,000 inhabitants. Not a ceiling nurhter with companies but by a fundamental gpd production based on agrilcutre. LULC gives us an nice overview of how the land use is actually composed on the region.

[IMAGE INTEIRA - LULC FEITA NO PHOTOSHOP]

The mountains planalt on the west, flatlands on the east. Some few cities spreaded at the basin, many coast ones, but a lot, a lot of agrilculture fields. Indeed, agriculture area land use represents 54% of the whole area analised. If we focus our attention with paddy rice, the Irrigation Collection of MapBiomas provide us a extension of the paddy rices in the basin.

[IMAGEM - PADDY RICE OVER LULC]

The paddy rice fields follow a very interesting pattern as spreaching throughout the whole flat landscape of the basin. When it gets towards the west where the mountains are, the land use is identified as forests. Actually the paddy rices are following the river networks. 
In fact, paddy rice fields represents 54% of all the agriculture/farming class of land use. So majority of all the crops in the region are paddy rice. 

[
 HISTOGRAM OF LANDLUSE LAND COVER
]

### Influence of seasons
Land use seasonality can be seen really well from aboce, by ussing satellite data and optical sensors, some combinations of values create this index which shows the greeness value of each pixels and refletct, in a way, the current state of the vegetation. The following gif shows how NDVI index varies over the months

[MONTHLY GIF OF NDVI VALUES]


Theare a interesing bloom of green during the summer (Jan) which is phenologically when the rice crops are reaching its peak, reflecting the full development of the crop canopy.Following flowering, the rice enters the maturation phase, culminating in harvest when the seeds 
reach maximum weight, a timing strongly influenced by prevailing weather conditions. After yielding, the NDVI droped, unti being completly red, represing the off season, when the land use get barren soil. 

[IMAGE ON SIDE OF RICE PHENOLOGY]

[IMAGE OF VV/NDVI TIME SERIES]

As a nice laser resource to understand seasonality of crops, is looking at multi-temporal maps composition
This composition here shows a as a red green band the month of January (coidning with the peak of rice crop), red band the month of June (coinciding with the barren soil) and blue in MARCH. If you not well in the gif, you will able to see that a very distinctive peak of green in March also happens, which denote crops types that are yielded before the winter. Which shows up this bluetish pattern on certain areas of the multi-composition
[MULTI-COMPOSITION NDVI -GEE]

Comming back to TW-DTW, Basically the strengh of TW-DTW comes from a lesser demand on the number of samples. This stregnth starts to make much more sense when we think about regions of data scarcity, the fact it is demanding labelling samples for DL models, lesser classes here imposes a strength at the generalization capacity of the model.

[create a table here:
The feature space considered for TW-DTW in relation to the target includes: - Sentinel 2: Band 08 - NIR - Sentinel 2: Band 12 – SWIR1 - Sentinel 2 derived index: NDVI  - Normalized Difference Vegetation Index - Sentinel 1: VH – Horizontal Backscattering - Sentinel 1:VV  - Vertical Backscattering  ]
[TABLE OF TUNNING PARAMETERS]
Well, by only using 13 true points of paddy rice fields By combining Optical imagery from Sentinel-2 and index as NDVI, with radar images from Sentinel-1, the phenological patterns were retrieved for the paddy rice samples. The time frame is from January 1th to 31 Dezember of 2020. Some contrainsts of Sentinel-1 operations within the region have available data only able for the year of 2020.
So as seem in the phenology, 

### Classification 
The TW-DTW output shows a binary classification result of rice and non rice crops
[CLASSIFICATION RESULTS]
The spatial distribution of the rice crops closely matches the patterns observed in the multi-temporal NDVI composite. a noticeable salt-and-pepper effect, with many isolated rice pixels scattered throughout the map. This highlights the need for further post-processing to 
remove such noise and improve the spatial coherence of the classification

As a other output of the DTW implementation in GEE is the dissimilarity score, represent the distance between each pixel’s time series and the 
reference rice time series. Generally, a lower distance indicates a higher similarity to the target  class, while a higher distance suggests that the pixel is less likely to belong to that class

[SIDE NOTE:
]

[DISSIMILARITY SCORE]
These dissimilarity scores represent the distance between each pixel’s time series and the 
reference rice time series. Generally, a lower distance indicates a higher similarity to the target 
class, while a higher distance suggests that the pixel is less likely to belong to that class.
In the dissimilarity map, paddy rice fields tend to have scores ranging from 0 to about ~20,000. Beyond 
the 20,000 threshold, the number of pixels with such high dissimilarity scores decreases 
substantially, indicating fewer samples with lower similarity. This suggests that the TW-DTW 
algorithm effectively uses these scores to assign classes, and thresholding serves as a deterministic 
way to fine-tune classification by separating likely rice pixels from others. 

the rice dissimilarity scores display a lower standard deviation compared to the Non
Rice scores, indicating less variability within the rice class. The rice histogram also shows a 
pronounced tail and a relatively small secondary peak around a dissimilarity score of 60,000. This 
feature is absent in the Non-Rice histogram, which, while exhibiting greater variability, is 
confined to a narrower score range compared to rice. 

[HISTOGRAM OF DISSIMILARITY SCORE]
### Fine tunning
To fine tunning the results a thresholding was applied, followed by connectivity analysis, eliminating single pixels with no surrouding pixels class
The image was post-processed using pixel connectivity analysis to eliminate isolated rice pixels 
and reduce the "salt and pepper" noise effect. A connected component labelling method with an 
eight-connected neighbourhood and a kernel radius of 1 was applied to identify groups of 
connected pixels. Only connected components with a size greater than seven pixels were retained, 
effectively removing small isolated pixel clusters and improving the spatial coherence of the rice 
field classification. 

### Assessment

Jaccard Index, Overlap and Dice were used to compare results from TW-DTW with Irrigation Collection from MapBiomas.
[TABLE WITH RESULTS:
{Asset 
Area 
(km²) 
Intersection 
(km²) 
Union 
(km²) 
Jaccard 
Index 
Irrigation 
MapBiomas – Rice 
9029.62 - - 
Overlap 
Dice 
Coefficient 
Absolute 
Error 
(km ²) - 
TWDTW – 
Rice 
(All 
prediction) 
8583.86 
7403.13 - - - 
9029.62 81.99% 86.26% 
OTSU 
Threshold 
(24.957) 
8306.36  
7389.53 
0.8406 
445.76 
9029.62 81.84% 88.96% 
Arbitrary 
Threshold – 
(33.000) 
8521.98 
7400.48 
0.8525 
723.26 
9029.62 81.96% 86.83% 
0.8432 
507.64}]
[GEE PANEL ]
Following the land use land cover map, I investigated 


The dice coefficient represents a reasonable value of similarity between the predicted TW-DTW 
pixel-classification with the compared collection. The area of prediction has a mean absolute error 
of 558km² over a total area of 48,814.00 km²

### RESULTS

THE results are all open and available at this gee painel

you can compare live with MapBiomas irrigation collection and other classes

[MAP BIOMAS PAINEL]

IF you look well you can see some error bias, a concentration of false 
positives near lakes and rivers, particularly over wetland vegetation. This bias may stem from 
seasonal hydrological patterns: in southern Brazil, heavy precipitation at the end of winter and 
beginning of spring (late August to early September) coincides with the seedling stage of paddy 
rice, when farmers flood parcels. This temporary water signal may be misinterpreted by the TW
DTW algorithm as indicative of rice cultivation.

### Consideration 

The methodology demonstrates significant potential for operational crop monitoring applications, 
particularly in regions characterized by limited training data availability. The algorithm's ability 
to achieve comparable accuracy with substantially reduced sample requirements positions it as a 
valuable tool for agricultural surveillance in data-constrained environments. 
However, several limitations must be acknowledged, including computational constraints that 
restricted analysis to single-year periods, potential wetland misclassification bias, and the need 
for enhanced parameter optimization. Future research should prioritize multi-temporal analysis, 
improved spectral-polari

### Futher Development
TW-DTW exhibits numerous vulnerabilities with substantial room for improvement. For 
instance, only polarimetric bands VV and VH, along with optical bands SWIR1 and NIR and the 
NDVI index, were tested for inference. Alternative band fusion approaches could be explored, 
incorporating indices that better preserve temporal feature characteristics. It remains uncertain 
whether additional bands or indices would contribute important information regarding temporal 
similarity scores and further improve results. 
uture developments should integrate radar-based satellite scattering mechanisms related to crop 
development, such as polarimetric decomposition features, entropy, anisotropy, embedding and 
anglemeasurements. 
Either the dissimilarity score could be used as a temporal tensor or combined architecture on deep 
learning models or TW-DTW could be represent a feature of a DL model.  


I guess, 
in the end TW-DTW do not perform as well as the Unet model, 
however it shows a path for exploring time features and input tensor for DL models.

### ACKNOWLEDGEMENTS
 



