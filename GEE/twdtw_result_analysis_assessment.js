/*
this is a gee script.
Author: Emanuel Goulart.
2025
*/

// Import external dependencies
var S2Masks = require('users/soilwatch/soilErosionApp:s2_masks.js'); // S2 handler
var palettes = require('users/gena/packages:palettes');
var Palettes_mapbiomas = require('users/mapbiomas/modules:Palettes.js'); // MapBiomas LULC Pallete Modulo
var palette = Palettes_mapbiomas.get('classification9');
  
// Add ROI
var roi = ee.FeatureCollection('projects/ee-emanuelgoulartf/assets/HidrogeoSC_Regiao_Hidrografica')
  .filter(ee.Filter.eq('rh_sigla','RH 10'));

Map.centerObject(roi,10);
  
// Assessment of TW-DTW for RICE mapping. Based on TW-DTW scores and thresholding 
// Load the pre-generated layers from assets as producing the data live takes a while to load and display,
// and may result in memory errors

// RICE DTW - Binary classification 
var dtw = ee.Image('projects/ee-emanuelgoulartf/assets/dtw_binary_rice_2020'); 
var dtw_score = dtw.select('score_2020');
var dtw_class = dtw.select('classification_2020');
Map.addLayer(dtw_class,{min:1,max:2},'raw dtw class',0);
Map.addLayer(dtw_score,{},'raw_dtw_score',0)

// VERY IMPORTANT NOTICE
// THE DTW score is ambiguos. This mean that is impossible to know looking stricly at the band 'score_2020' 
//from which class does that value come from. To overcome it, it is necessary to create a mask with the band
//'classifcation_2020' and then apply any threhold in order to post-processing the classification. 
 
/**/ // Add all essential dataset to the analisys 
// LULC 
var vis = {'min': 0,'max': 69,'palette': palette,'format': 'png'};
var colecao = ee.Image('projects/mapbiomas-public/assets/brazil/lulc/collection_S2_beta/collection_LULC_S2_beta')
var colecao_2020 = colecao.select(4).clip(roi)
Map.addLayer(colecao_2020, vis, 'OG - LULC',0)

// Remap LULC 
var fromList = [1,3,4,5,6,49, 11,12,32,29,50, 18,19,39,20,62,41,36,46,47,35,48, 22,23,24,30,25, 26,33,31,27, 21, 9, 15, 40];
var toList =  [1,1,1,1,1,1, 2,18,2,2,2, 18,18,18,18,18,18,18,18,18,18,18, 4,4,4,4,4, 5,5,5,5, 18, 9, 15, 18];

// The result of the Remap is:
// 1 - floresta - florest 
// 2 - vegetacao herbeacea - Herbaceous and Shrubby Vegetation
// 18 - agrilculture - 
// 15 - Pasture
// 12 - Grassland - Grassland are not a typical LULC present on the region
// 9 - forest plantation (eucaliptus)
// 21 - mosaic of uses
// 4 - non vegetated area
// 5 - water
// 40 - rice
var imgRemap = colecao_2020.remap({
  from: fromList,
  to: toList,
  defaultValue: 0,
  bandName: 'classification_2020'
});

// Add remap to LULC map
Map.addLayer(imgRemap, vis, 'LULC - remapped',0)

// Mask LULC 
// Mask everything that is not agrilcultural LULC class.
var lulc_agrilc = imgRemap.updateMask(imgRemap.eq(18)).clip(roi);
Map.addLayer(lulc_agrilc,{palette:'#2bff59'},'LULC - Agrilc',0);

// Add DTW score without mask
// verification step 
Map.addLayer(dtw_score,{},'DTW score - all',0)
Map.addLayer(dtw_class,{palette:['#2532e4','#e4214e'],min:1,max:2},'DTW Classification - All',0);


// Add MAPBIOMAS Layer to understand Rice 
// MapBiomas layer refers to agricultural fields classified with Sentinel-2 
// The MapBiomas classification includes few crop types, as Rice. 
//vallues of 2 represent irrigated rice
//values of 3 represent irrigated agricultered areas 
var irrigat_agric = ee.Image('projects/mapbiomas-public/assets/brazil/lulc/collection9/mapbiomas_collection90_irrigated_agriculture_v1')
  .select(['irrigated_agriculture_2020'])
  .divide(100)
  .toInt()
  .clip(roi); // clip for the watershed extent

Map.addLayer(irrigat_agric,{},'Irrigated Agric - MapBiomas',0);

/**/ //---------------------------------------------------------------------------
// ANALISYS 

// RICE
// 1  = means rice
var rice_score = dtw_score
                    .updateMask(dtw_class.eq(1))  //mask with the assigned class
                    .updateMask(lulc_agrilc); // mask agrilculture classes from LULC Mapbiomas
Map.addLayer(rice_score,{palette:'#2532e4'},'Rice',0)

// Create an histogram of the masked areas 
// var rice_hist_mask = ui.Chart.image.histogram({image:rice_score,
//                             region:roi, 
//                             scale:10,
//                             maxPixels:1e9});
// print('rice histogram masked: ')
// print(rice_hist_mask)

// Rice without the LULC Agrilculture Mapbiomas mask
// Just for checking and masking evaluation
var rice_score_without_lulc = dtw_score
                    .updateMask(dtw_class.eq(1))  //mask with the assigned class
                   // .updateMask(lulc_agrilc); // mask agrilculture classes from LULC Mapbiomas
Map.addLayer(rice_score_without_lulc,{palette:'#2532e4'},'Rice without LULC',0)

// Create an histogram of the masked areas 
// var rice_hist_mask = ui.Chart.image.histogram({image:rice_score,
//                             region:roi, 
//                             scale:10,
//                             maxPixels:1e9});
// print('rice histogram masked: ')
// print(rice_hist_mask)

// Non-rice
// 2 means not rice
var non_rice_score = dtw_score
                    .updateMask(dtw_class.eq(2))
                    .updateMask(lulc_agrilc);
Map.addLayer(non_rice_score,{palette:'#e4214e'},'Non Rice',0)

// Create an histogram of the masked areas 
// var rice_hist_mask = ui.Chart.image.histogram({image:non_rice_score,
//                             region:roi, 
//                             scale:10,
//                             maxPixels:1e9});
// print('Non Rice histogram masked: ')
// print(rice_hist_mask) 

// Create an histogram for all the score - without masking 
// var all_score = ui.Chart.image.histogram({image:dtw_score,
//                             region:roi, 
//                             scale:10,
//                             maxPixels:1e9});
                            
// print('All score: ')
// print(all_score) 


/**///  ------- Thresholding
// ------------------------------------------------------------------
// Compute OTSU-Threholding
// Compute the histogram
var histogram_rice_score = rice_score.reduceRegion({
  reducer: ee.Reducer.histogram(255, 2)
      .combine('mean', null, true)
      .combine('variance', null, true), 
  geometry: roi, 
  scale: 10,
  bestEffort: true
});
print('Histogram Rice Score')
print(histogram_rice_score);

// var histogram_all = dtw_score.reduceRegion({
//   reducer: ee.Reducer.histogram(255, 2)
//       .combine('mean', null, true)
//       .combine('variance', null, true), 
//   geometry: roi, 
//   scale: 10,
//   bestEffort: true
// });
// print('Histogram for all scores')
// print(histogram_all);


// // Return the DN that maximizes interclass variance (in the region).
var otsu = function(histogram) {
  var counts = ee.Array(ee.Dictionary(histogram).get('histogram'));
  var means = ee.Array(ee.Dictionary(histogram).get('bucketMeans'));
  var size = means.length().get([0]);
  var total = counts.reduce(ee.Reducer.sum(), [0]).get([0]);
  var sum = means.multiply(counts).reduce(ee.Reducer.sum(), [0]).get([0]);
  var mean = sum.divide(total);
  
  var indices = ee.List.sequence(1, size);
  
  // Compute between sum of squares, where each mean partitions the data.
  var bss = indices.map(function(i) {
    var aCounts = counts.slice(0, 0, i);
    var aCount = aCounts.reduce(ee.Reducer.sum(), [0]).get([0]);
    var aMeans = means.slice(0, 0, i);
    var aMean = aMeans.multiply(aCounts)
        .reduce(ee.Reducer.sum(), [0]).get([0])
        .divide(aCount);
    var bCount = total.subtract(aCount);
    var bMean = sum.subtract(aCount.multiply(aMean)).divide(bCount);
    return aCount.multiply(aMean.subtract(mean).pow(2)).add(
          bCount.multiply(bMean.subtract(mean).pow(2)));
  });
  
  print(ui.Chart.array.values(ee.Array(bss), 0, means));
  
  // Return the mean value corresponding to the maximum BSS.
  return means.sort(bss).get([-1]);
};

var threshold = otsu(histogram_rice_score.get('score_2020_histogram'));
print('threshold', threshold);

// Apply OTSU threholding as a mask
var otsu_thr = rice_score.lt(threshold);
var rice_otsu = rice_score.updateMask(otsu_thr);
Map.addLayer(rice_otsu,{palette:'#2bff59'},'OTSU',0)


// -------------------- Post Processing the Image
// Here I am gonna use pixelconnectivity to eliminate isolated rice pixels. 
// This will reduce the salt and pepper effect of the analysis.


function PostProcessed(image,max_Size_pixels){
  // This limits the maximum connectivity of pixels equals to 10.
  
  var connected = image.gt(0).selfMask().connectedComponents({
    connectedness:  ee.Kernel.square({radius: 2}), // 8-connected
    maxSize: 25
  });

  // Count pixels in each component
  var pixelCount = connected.select('labels')
    .connectedPixelCount({
      maxSize: 25 //MAX CONNECTIVITY IS 10 PIXELS
    });
    
  // Keep only components with more than N pixels
  var minPixels = max_Size_pixels; // adjust threshold
  var mask_small_pixels = pixelCount.gt(minPixels);
  
  // Create a binary image where small pixels = 1, everything else = 0
  var smallPixelsBinary = mask_small_pixels.mask().unmask(0);
  //Map.addLayer(smallPixelsBinary, {palette: ['black', 'white']}, 'small_pixels_binary');
  
  // Create inverted mask: 0 where small pixels are, 1 everywhere else
  var invertedMask = smallPixelsBinary.not();
  
  // Finally apply to the OTSU threhold and apply Morphology Operation (Erosion Dilatation)
  var img_postprocess = image
                              .updateMask(invertedMask)
                              .focalMin(2, 'square')
                              .focalMax(2,'square');
  return img_postprocess
}

var otsu_postprocess = PostProcessed(rice_otsu,10);
var all_rice_score_dtw_postprocess = PostProcessed(rice_score,10);
var thr_30000_post = PostProcessed(rice_score.updateMask(rice_score.lt(33000)),10);


Map.addLayer(all_rice_score_dtw_postprocess,{palette:'green'},'all score rice')
Map.addLayer(thr_30000_post,{palette:'blue'}, '30000 thre')
Map.addLayer(otsu_postprocess,{palette:'red'},'OTSU post-process')

/**/ //
//Export Assets for being publicaly available:

function export_asset(image_asset, name_file) {
  var reproject_image = image_asset.reproject({
    crs: 'EPSG:32722',
    scale: 10
  });
  
  // Export the image to drive in order to create significant maps 
  Export.image.toAsset({
    image: reproject_image,        // Fixed variable name
    description: 'Export-DTW-RESULTS-',
    assetId: name_file.getInfo(),
    region: roi,
    crs: 'EPSG:32722', 
    scale: 10,
    maxPixels: 1e9
  });
}

export_asset(all_rice_score_dtw_postprocess,ee.String("dtw_rice_postprocess"))
export_asset(thr_30000_post,ee.String("arbitrary_postprocess"))
export_asset(otsu_postprocess,ee.String("otsu_postprocess"))

export_asset(rice_score,ee.String("dtw_rice_raw"))
export_asset(rice_score.updateMask(rice_score.lt(33000)),ee.String("arbitrary_raw"))
export_asset(rice_otsu,ee.String("otsu_raw"))

         

/**/ 
// ------------------------------------------------------------------------
// Accuracy Assessment
// The following lines refers to assessment of the methodology

// Numbr of pixels that was classified and threshold as rice.
var otsu_postprocess_values_pixel = otsu_postprocess
                            .reduceRegion({
                        geometry: roi,
                        reducer:ee.Reducer.count(),// ee.Reducer.sum().setOutputs(['sum']),
                        scale: 10,
                        crs: 'EPSG:4326',
                        maxPixels: 1e9
});

//------------------------------------------------------------------------
print('Irrigation MAPBIOMAS')
print(irrigat_agric)

var predicted = ee.Image(1).updateMask(otsu_postprocess).clip(roi)
Map.addLayer(predicted)
print(predicted)

var ground_truth = ee.Image(1).updateMask(irrigat_agric).clip(roi)
var matches = predicted.eq(ground_truth).clip(roi);
Map.addLayer(matches,{},'matches')

// Number of pixels matching
var matchCount = matches.reduceRegion({
    reducer: ee.Reducer.count(),
    geometry: roi,
    scale: 10, // Adjust scale based on your data resolution
    maxPixels: 1e9,
    bestEffort: true
  });
print('MatchCount')
print(matchCount)

var sizeGround = ground_truth.reduceRegion({
  reducer: ee.Reducer.count(),
  geometry: roi,
  scale:10,
  maxPixels:1e9,
  bestEffort:true
});
print('Ground Truth - PIxels')
print(sizeGround)

var sizeOTSU = otsu_postprocess.reduceRegion({
  reducer: ee.Reducer.count(),
  geometry: roi,
  scale:10,
  maxPixels:1e9,
  bestEffort:true
});
print('Predicted Size')
print(sizeOTSU)

var size_all_rice_score_dtw_postprocess = all_rice_score_dtw_postprocess.reduceRegion({
  reducer: ee.Reducer.count(),
  geometry: roi,
  scale:10,
  maxPixels:1e9,
  bestEffort:true
});
print('Score DTW for All rice pixels - without thresholding')
print(size_all_rice_score_dtw_postprocess)

var matches_all_rice_score = ee.Image(1)
                              .updateMask(all_rice_score_dtw_postprocess)
                              .eq(ground_truth)
                              .clip(roi)
                              
var size_matches_all_rice_score = matches_all_rice_score.reduceRegion({
  reducer: ee.Reducer.count(),
  geometry: roi,
  scale:10,
  maxPixels:1e9,
  bestEffort:true
});
print('Number of matching pixels with all rice score')
print(size_matches_all_rice_score)

// Calculate the matching of the 
var size_thr_30000_post = thr_30000_post.reduceRegion({
  reducer: ee.Reducer.count(),
  geometry: roi,
  scale:10,
  maxPixels:1e9,
  bestEffort:true
});
print('33000 thresholding');
print(thr_30000_post);

var matches_30000_score = ee.Image(1)
                              .updateMask(thr_30000_post)
                              .eq(ground_truth)
                              .clip(roi)
var size_matches_30000 = matches_30000_score.reduceRegion({
  reducer: ee.Reducer.count(),
  geometry: roi,
  scale:10,
  maxPixels:1e9,
  bestEffort:true
});                 
print('Matching with 33000 thre')
print(size_matches_30000)

// Analysis of matching pixels 

// Getting all pixels that are not matching for a more robust analysis

// var non_matching = predicted.neq(ground_truth).updateMask();

// var predicted_masked_non_match = predicted.updateMask(non_matching)
// var gt_masked_non_match = ground_truth.updateMask(non_matching)
// Map.addLayer(non_matching,{palette:'black'},'Non Matching Pixels');



//-------------------------------------------------------------------
// Export the image to drive in order to create significant maps 
// Export.image.toDrive({image:dtw_score.clip(roi),
//                       description :'Export-DTW',
//                       folder:'DT-TWD',
//                       fileNamePrefix :'DTW_2020_rice_score_32722',
//                       region:roi,
//                       crs:'EPSG:4326', 
//                       crsTransform:'EPSG:32722', //UTM 22S
//                       scale:10,
//                       maxPixels:1e9})


// ---------------------------------------------------------------------
// Fetch assets of montlhy composition
// satellite-imagery-time-series - Sentinel1 and Sentinel2
// These are the time series images used to calculate the TW-DTW
// The following lines is used to create some nice visualizations of the time series

// var sits = ee.Image('projects/ee-emanuelgoulartf/assets/S1S2-TS-2020');
// print(sits);

// var viz_sites = {bands:['ndvi_2','ndvi_11','ndvi_5']};
// // Janaruary is the peak of the flowering - R4. Which some research denotes highest NDVI
// var band_names = ['ndvi_3','ndvi','ndvi_7']
// var viz_sites2 = {bands:band_names, min:-328,max:7065};
// Map.addLayer(sits.select(band_names),viz_sites2,'sits');

// var band_names_ = ['VV_1','VV_3','VV']
// var viz_sites_ = {bands:band_names_};
// Map.addLayer(sits,viz_sites_,'sits-VH');

// Fetch assets of montlhy composition
// satellite-imagery-time-series - Sentinel1 and Sentinel2
// 
// var sits = ee.Image('projects/ee-emanuelgoulartf/assets/S1S2-TS-2020');
// print(sits);

// var viz_sites = {bands:['ndvi_2','ndvi_11','ndvi_5']};
// // Janaruary is the peak of the flowering - R4. Which some research denotes highest NDVI
// var band_names = ['ndvi_3','ndvi','ndvi_7']
// var viz_sites2 = {bands:band_names, min:-328,max:7065};
// Map.addLayer(sits.select(band_names),viz_sites2,'sits');

// var band_names_ = ['VV_1','VV_3','VV']
// var viz_sites_ = {bands:band_names_};
// Map.addLayer(sits,viz_sites_,'sits-VH');


                      