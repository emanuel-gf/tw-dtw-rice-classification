/*
gee script.
Author: Emanuel Goulart.
2025
*/

var Palettes_mapbiomas = require('users/mapbiomas/modules:Palettes.js'); // MapBiomas LULC Pallete Modulo
var palette = Palettes_mapbiomas.get('classification9');
// Add ROI
var roi = ee.FeatureCollection('projects/ee-emanuelgoulartf/assets/HidrogeoSC_Regiao_Hidrografica')
  .filter(ee.Filter.eq('rh_sigla','RH 10'));
  
// Irrigated Agrilculture from MAPbiomas
// MapBiomas layer refers to agricultural fields classified with Sentinel-2 
// The MapBiomas classification includes few crop types, as Rice. 
// var irrigat_agric = ee.Image('projects/mapbiomas-public/assets/brazil/lulc/collection9/mapbiomas_collection90_irrigated_agriculture_v1')
//   .select(['irrigated_agriculture_2020','irrigated_agriculture_2021'])
//   .divide(100)
//   .toInt()
//   .clip(roi); // clip for the watershed extent
  
// Map.addLayer(irrigat_agric)
// var reproject_image_dtw = irrigat_agric.reproject({
//   crs:'EPSG:32722',
//   scale:10
// })

// // Export the image to drive in order to create significant maps 
// Export.image.toDrive({image:irrigat_agric,
//                       description :'Export-DTW',
//                       folder:'DT-TWD',
//                       fileNamePrefix :'MAPBIOMAS-IRRIGAT-32722',
//                       region:roi,
//                       crs:'EPSG:32722', 
//                   //     crsTransform:'EPSG:32722', //UTM 22S
//                       scale:10,
//                       maxPixels:1e9})
                       
// // // Download images 
var dtw = ee.Image('projects/ee-emanuelgoulartf/assets/dtw_binary_rice_2020');

// var dtw_score = dtw.select('score_2020');
//var dtw_class = dtw.select('classification_2020');


// var reproject_image_dtw = dtw.reproject({
//   crs:'EPSG:32722',
//   scale:10
// })

// // Export the image to drive in order to create significant maps 
// Export.image.toDrive({image:reproject_image_dtw,
//                       description :'Export-DTW',
//                       folder:'DT-TWD',
//                       fileNamePrefix :'DTW_2020_binary_rice_score_class_32722',
//                       region:roi,
//                       crs:'EPSG:32722', 
//                   //     crsTransform:'EPSG:32722', //UTM 22S
//                       scale:10,
//                       maxPixels:1e9})
                       
                       
// // LULC 
var vis = {'min': 0,'max': 69,'palette': palette,'format': 'png'};
var colecao = ee.Image('projects/mapbiomas-public/assets/brazil/lulc/collection_S2_beta/collection_LULC_S2_beta')
var colecao_2020 = colecao.select(4).clip(roi)
// Map.addLayer(colecao_2020, vis, 'OG - LULC')


// /**/ // Remap LULC 
var fromList = [1,3,4,5,6,49, 11,12,32,29,50, 18,19,39,20,62,41,36,46,47,35,48, 22,23,24,30,25, 26,33,31,27, 21, 9, 15, 40];
var toList =  [1,1,1,1,1,1, 2,2,2,2,2, 18,18,18,18,18,18,18,18,18,18,18, 4,4,4,4,4, 5,5,5,5, 18, 9, 15, 18];

// // The result of the Remap is:
// // 1 - floresta - florest 
// // 2 - vegetacao herbeacea - Herbaceous and Shrubby Vegetation
// // 18 - agrilculture - 
// // 15 - Pasture
// // 9 - forest plantation (eucaliptus)
// // 21 - mosaic of uses
// // 4 - non vegetated area
// // 5 - water
// // 40 - rice
// Add remap to LULC map
var imgRemap = colecao_2020.remap({
  from: fromList,
  to: toList,
  defaultValue: 0,
  bandName: 'classification_2020'
});
Map.addLayer(imgRemap, vis, 'LULC - remapped');

/**/// Mask LULC 
var lulc_agrilc = imgRemap.updateMask(imgRemap.eq(18)).clip(roi);
Map.addLayer(lulc_agrilc,{palette:'#2bff59'},'LULC - Agrilc');

  
// // EXPORT LULC TO DRIVE

// var remapped_lulc_reproject = imgRemap.reproject(
//   {crs:'EPSG:32722',
//     scale:10
//   });
// var lulc_agrilc_reproject = lulc_agrilc.reproject(
//   {
//     crs: 'EPSG:32722',
//     scale:10
//   });



// Export.image.toDrive({image:lulc_agrilc_reproject,
//                       description :'Export-LULC-MASK',
//                       folder:'DT-TWD',
//                       fileNamePrefix :'LULC_remaped_masked_agrilc_32722',
//                       region:roi,
//                       crs:'EPSG:32722', 
//                   //     crsTransform:'EPSG:32722', //UTM 22S
//                       scale:10,
//                       maxPixels:1e9}) 
                      

// Export.image.toDrive({image:imgRemap,
//                       description :'Export-DTW-LULC',
//                       folder:'DT-TWD',
//                       fileNamePrefix :'LULC_remaped_32722',
//                       region:roi,
//                       crs:'EPSG:32722', 
//                   //     crsTransform:'EPSG:32722', //UTM 22S
//                       scale:10,
//                       maxPixels:1e9}) 

// // SITS
// var sits = ee.Image('projects/ee-emanuelgoulartf/assets/S1S2-TS-2020');
// print(sits);

// var sits_reproject = sits.select([['VV.*', 'NDVI.*']])
// print(sits_reproject)


// Export the Rice and Non-rice classifieed classes containing the masked values from the LULC mapbiomas
var dtw_masked_agrilc_lulc = dtw.updateMask(lulc_agrilc)
print('msked')
print(dtw_masked_agrilc_lulc)
Map.addLayer(dtw_masked_agrilc_lulc.select('classification_2020'))



var dtw_masked_agrilc_lulc_reproject = dtw_masked_agrilc_lulc.reproject(
  {
    crs: 'EPSG:32722',
    scale:10
  });



Export.image.toDrive({image:dtw_masked_agrilc_lulc_reproject,
                      description :'Export-DTW-masked-LULC',
                      folder:'DT-TWD',
                      fileNamePrefix :'DTW-masked_agrilc_32722',
                      region:roi,
                      crs:'EPSG:32722', 
                  //     crsTransform:'EPSG:32722', //UTM 22S
                      scale:10,
                      maxPixels:1e9}) 