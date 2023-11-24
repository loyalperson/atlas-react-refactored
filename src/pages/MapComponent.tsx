import { ChangeEvent, useEffect, useRef, useState } from 'react';

import PopupInfo from '../components/PopupInfo';
import PopupPortal from '../components/PopupPortal';
import '../styles/globals.css';
import '../styles/custom.css';
import axios from 'axios';
import Graphic from '@arcgis/core/Graphic';
import Map from '@arcgis/core/Map';
import PopupTemplate from '@arcgis/core/PopupTemplate';
import Point from '@arcgis/core/geometry/Point';
import { locationToAddress } from '@arcgis/core/rest/locator';
import AddressCandidate from '@arcgis/core/rest/support/AddressCandidate.js';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import MapView from '@arcgis/core/views/MapView';
import Search from '@arcgis/core/widgets/Search';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import MapImageLayer from '@arcgis/core/layers/MapImageLayer'
import proj4 from 'proj4';
import { Sidebar } from 'primereact/sidebar';
const popupRoot = document.createElement('div');

export default function MapComponent() {
  const mapDiv = useRef<HTMLDivElement>(null);
  const [popupData, setPopupData] = useState<AddressCandidate | null>(null);
  const [view, setView] = useState<any>(null);
  const [selectedMap, setSelectedMap] = useState<string>('Satellite');
  const [addedLayer, setAddedLayer] = useState<FeatureLayer|MapImageLayer|null>(null);
  const [displayData, setDisplayData] = useState<any | null>(null);

  const webMercator = '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs';
  const decimalDegrees = '+proj=longlat +datum=WGS84 +no_defs';
  const [visible, setVisible] = useState(false);

  const getSelectedData = async (mapType:string, point:Point, callType:number) => {
    let featureLayer: FeatureLayer;
    let featureURL: string = '';
    switch(mapType){
      case 'Parcel_View':
        featureURL = "https://services.arcgis.com/jsIt88o09Q0r1j8h/arcgis/rest/services/Current_Parcels/FeatureServer/0/";
        break;
      case 'Income_Centroids':
        featureURL = "https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/ACS_10_14_Household_Income_Distribution_Boundaries/FeatureServer/2";
        break;
      case 'Income_Boundaries':
        featureURL = "https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/ACS_10_14_Household_Income_Distribution_Boundaries/FeatureServer/2";
        break;
      default:
        featureURL = ''
    }
    featureLayer = new FeatureLayer({
      url: featureURL
    });
    const query = featureLayer.createQuery();
    query.geometry = point;
    query.spatialRelationship = 'intersects';
    query.returnGeometry = true;
    query.outFields = ['*'];
    const queryResult = await featureLayer.queryFeatures(query);
    console.log('------->queryResult attributes',queryResult); // Example: Display the attributes in the console

    const features = queryResult.features;

    if (features.length > 0) {
      const firstFeature = features[0];
      const attributes = firstFeature.attributes;
      if(callType == 1){
        setDisplayData(attributes);
        setVisible(true);
      }
      if(callType == 2){
        if(mapType == "Parcel_View"){
          if (typeof window !== 'undefined') {
            localStorage.setItem('parcelData', JSON.stringify(attributes));
          }
        }
        if(mapType == "Income_Boundaries"){
          if (typeof window !== 'undefined') {
            localStorage.setItem('incomeData', JSON.stringify(attributes));
          }
        }
      }
      console.log('------->parcel attributes',attributes); // Example: Display the attributes in the console
    }
  }
  

  const mapFunction = (mapType:string) => {
    const map = new Map({
      basemap: 'satellite',
    });

    if(addedLayer != null)
      map.remove(addedLayer);
    let featureURL: string = '';
    let imageLayerURL: string = 'https://elevation.arcgis.com/arcgis/rest/services/WorldElevation/DataExtents/MapServer';
    let featureLayer: FeatureLayer;
    let isFeatureLayer: number = 0;

    switch(mapType){
      case 'Parcel_View':
        featureURL = "https://services.arcgis.com/jsIt88o09Q0r1j8h/arcgis/rest/services/Current_Parcels/FeatureServer/0/";
        break;
      case 'Income_Centroids':
        featureURL = "https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/ACS_Household_Income_Distribution_Centroids/FeatureServer/2";
        break;
      case 'Income_Boundaries':
        featureURL = "https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/ACS_10_14_Household_Income_Distribution_Boundaries/FeatureServer/2";
        break;
      default:
        featureURL = ''
    }
    
    if(mapType == 'Parcel_View' || mapType == 'Income_Centroids' || mapType == 'Income_Boundaries'){
      featureLayer = new FeatureLayer({
        url: featureURL,
        opacity: 0.8
      });
      map.add(featureLayer);
      setAddedLayer(featureLayer);
      featureLayer.popupEnabled = true;
      isFeatureLayer = 1;
    }

    if(mapType == "Elevation") {
      const elevationLayer = new MapImageLayer({
        // url: "https://elevation.arcgis.com/arcgis/rest/services/WorldElevation/DataExtents/MapServer",  //Elevation Map
        url: "https://services.arcgisonline.com/ArcGIS/rest/services/USA_Topo_Maps/MapServer",  //Elevation Map
        sublayers: [
          {
            id: 0,
            visible: true
          }
        ],
        opacity: 0.8
      });
      map.add(elevationLayer);
      setAddedLayer(elevationLayer);
    }
    
    const mapView = new MapView({
      container: mapDiv.current!,
      map,
      // seattle coordinates
      center: [-122.335167, 47.608013],
      zoom: 12,
      // popupEnabled: true,
      popup: {
        dockEnabled: true,
        dockOptions: {
          buttonEnabled: false,
          breakpoint: false,
          position: 'bottom-right',
        },
        collapseEnabled: false,
        visibleElements: {
          closeButton: false,
        },
        viewModel: {
          includeDefaultActions: false,
        },
      },
    });

    const searchWidget = new Search({
      view: mapView,
      container: 'searchWidget',
    });

    mapView
      .when(() => {
        mapView.ui.add(searchWidget, {
          position: 'top-right',
        });
        setView(mapView);
        mapView.popupEnabled = false;
        mapView.on('click', async (event) => {
          console.log('------------->event.mapPoint',event.mapPoint)
          try {
            const response = await locationToAddress(
              'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer',
              {
                location: event.mapPoint,
              },
            );
            
            if (typeof window !== 'undefined') {
              localStorage.setItem('Address', response.address);
            }
            
            getSelectedData("Parcel_View", event.mapPoint, 2);
            getSelectedData("Income_Boundaries", event.mapPoint, 2);

            console.log(
              '🚀 ~ file: MapComponent.tsx:240 ~ mapView.on ~ response:',
              response,
            );

            if(isFeatureLayer == 1){
              if (response.address) {
                getSelectedData(mapType,event.mapPoint,1);
              }
            }
              
            let convertedCoordinates = proj4(webMercator, decimalDegrees, [event.mapPoint.x, event.mapPoint.y]);
            console.log('---->convertedCoordinates', convertedCoordinates);
            const locationToElevation = await axios.post('https://api.open-elevation.com/api/v1/lookup', {"locations":[{"latitude": convertedCoordinates[1], "longitude":convertedCoordinates[0]}]});
            console.log('---->locationToElevation', locationToElevation.data.results[0].elevation);
            let elevationResult = locationToElevation.data.results[0].elevation;
            if (typeof window !== 'undefined') {
              localStorage.setItem('Elevation', JSON.stringify(locationToElevation.data.results[0]));
            }

            if(mapType == 'Elevation'){
              setDisplayData({elevation:elevationResult});
              setVisible(true);
            }
            // showPopup(event.mapPoint, response.address, mapView);
            mapView.popup.open({
              title: response.address,
              location: event.mapPoint,
              content: (() => {
                setPopupData(response);
                return popupRoot;
              })(),
            });
          } catch (error) {
            console.error('Error fetching address:', error);
          }
        });
      })
      .catch((error) => {
        console.log(
          '🚀 ~ file: MapComponent.tsx:235 ~ mapView.when ~ error:',
          error,
        );
      });
  }
  
  useEffect(() => {
    if (!view) {
      mapFunction('Satellite');
    }
  }, [view]);
  
  const changeSelectionHandler = (mapType:string) => {
    console.log('---------->mapType',mapType)
    setSelectedMap(mapType);
    mapFunction(mapType);
  }
  // console.log('🚀 ~ file: MapComponent.tsx:240 ~ showPopup ~ view:', view);

  const showPopup = (point: Point, address: string, mapView: MapView) => {
    console.log(
      '🚀 ~ file: MapComponent.tsx:305 ~ showPopup ~ address:',
      address,
    );
    mapView.popup.close();
    mapView.graphics.removeAll();

    const popupTemplate = new PopupTemplate({
      title: '{address}',
      content: `<div class="popup-content">
      <h3>Location Details</h3>
      <p>Latitude: {latitude}</p>
      <p>Longitude: {longitude}</p>
      <!-- Your chatbox HTML/CSS content here -->
      <div class="chatbox">
        <div class="chatbox-messages">
          <!-- Chat messages go here -->
        </div>
        <input type="text" placeholder="Type a message...">
        <button>Send</button>
      </div>
    </div>`,
    });

    const markerSymbol = new SimpleMarkerSymbol({
      color: [226, 119, 40],
      outline: {
        color: [255, 255, 255],
        width: 1,
      },
    });

    const graphic = new Graphic({
      geometry: new Point({
        longitude: point.longitude,
        latitude: point.latitude,
        spatialReference: mapView.spatialReference,
      }),
      symbol: markerSymbol,
      popupTemplate,
      attributes: {
        address,
        latitude: point.latitude,
        longitude: point.longitude,
      },
    });

    // mapView.graphics.removeAll();
    mapView.graphics.add(graphic);
    mapView.popup.open({
      location: point,
      features: [graphic],
    });
  };

  return (
    <section id="map-page-container" className="w-full h-screen">
      <header
        className="bg-light-green w-full flex justify-between items-center p-4"
        style={{ height: '10%' }}
      >
        <div className="flex items-center">
          <a href="#">
            <img
              src="https://www.dropbox.com/scl/fi/ensej1l64crnkpsmy2kbi/atlaspro-light-logo-1.png?rlkey=t18h2pq0lez222klradjj8fy9&raw=1"
              alt="Atlas Pro Intelligence Logo"
              className="mx-auto" // Adjust the class as needed for styling
              width="100%"
              style={{ maxWidth: '150px' }}
            />
          </a>
        </div>
        <div className="flex items-center">
          <a
            href="https://app.atlaspro.ai/api/auth/logout"
            className="cursor-pointer select-none items-center gap-3 rounded-md p-3 text-white transition-colors duration-200 hover:text-white/30"
          >
            Logout
          </a>
        </div>
      </header>
      <div style={{marginTop:'10px',marginBottom:'-10px'}}>
        <label htmlFor="mapSelector" style={{color:'white', marginLeft:'90px'}}>Select map:&nbsp;&nbsp;</label>
        <select
          id="mapSelector"
          value={selectedMap}
          onChange={(e)=>changeSelectionHandler(e.target.value)}
        >
          <option value="Satellite">Satellite Map</option>
          <option value="Parcel_View">Parcel Viewer Map</option>
          <option value="Income_Centroids">Income Distribution with Centroids</option>
          <option value="Income_Boundaries">Income Distribution with Boundaries</option>
          <option value="Elevation">Elevation Map</option>
        </select>
      </div>
      <div
        ref={mapDiv}
        style={{
          height: '90%',
          width: '90%',
          margin: 'auto',
          paddingLeft: '150px',
          overflow: 'hidden',
          padding: '20px 0px',
        }}
      >
        <PopupPortal mountNode={popupRoot}>
          <PopupInfo address={popupData}></PopupInfo>
        </PopupPortal>
        <Sidebar visible={visible} onHide={() => setVisible(false)}>
          <p style={{fontSize:'25px', marginBottom:'30px', fontWeight:'500'}}>Information</p>
          
          {displayData && displayData.GlobalID &&
            <div style={{lineHeight:'30px', marginLeft:'15px', fontWeight:'400'}}>
              <p><span style={{fontWeight:'500'}}>Area Code:</span>&nbsp; {displayData.FIPS_NR}</p>
              <p><span style={{fontWeight:'500'}}>County Name:</span>&nbsp; {displayData.COUNTY_NM}</p>
              <p><span style={{fontWeight:'500'}}>Parcel Identification Number:</span>&nbsp; {displayData.PARCEL_ID_NR}</p>
              <p><span style={{fontWeight:'500'}}>Original Parcel ID:</span>&nbsp; {displayData.ORIG_PARCEL_ID}</p>
              <p><span style={{fontWeight:'500'}}>Property Address:</span>&nbsp; {displayData.SITUS_ADDRESS}</p>
              <p><span style={{fontWeight:'500'}}>Sub-address:</span>&nbsp; {displayData.SUB_ADDRESS}</p>
              <p><span style={{fontWeight:'500'}}>City Name:</span>&nbsp; {displayData.SITUS_CITY_NM}</p>
              <p><span style={{fontWeight:'500'}}>ZIP Code:</span>&nbsp; {displayData.SITUS_ZIP_NR}</p>
              <p><span style={{fontWeight:'500'}}>Land Use Code:</span>&nbsp; {displayData.LANDUSE_CD}</p>
              <p><span style={{fontWeight:'500'}}>Land Value:</span>&nbsp; {displayData.VALUE_LAND}</p>
              <p><span style={{fontWeight:'500'}}>Building Value:</span>&nbsp; {displayData.VALUE_BLDG}</p>
              <p><span style={{fontWeight:'500'}}>Parcel Data Link:</span>&nbsp; <span><a style={{color:"blue"}} href={displayData.DATA_LINK}>View</a></span></p>
              <p><span style={{fontWeight:'500'}}>Total Area:</span>&nbsp; {displayData.Shape__Area}</p>
              <p><span style={{fontWeight:'500'}}>Boundary Length:</span>&nbsp; {displayData.Shape__Length}</p>
            </div>
          }

          {displayData && displayData.GEOID &&
            <div style={{lineHeight:'30px', marginLeft:'15px', fontWeight:'400'}}>
              <p><span style={{fontWeight:'500'}}>Name:</span>&nbsp; {displayData.NAME}</p>
              <p><span style={{fontWeight:'500'}}>Area Code:</span>&nbsp; {displayData.GEOID}</p>
              <p><span style={{fontWeight:'500'}}>Area of Land (Square Meters):</span>&nbsp; {displayData.ALAND}</p>
              <p><span style={{fontWeight:'500'}}>Area of Water (Square Meters):</span>&nbsp; {displayData.AWATER}</p>
              <p><span style={{fontWeight:'500'}}>Total households:</span>&nbsp; {displayData.B19001_001E}</p>
              <p><span style={{fontWeight:'500'}}>Total households- Margin of Error:</span>&nbsp; {displayData.B19001_001M}</p>
              <p><span style={{fontWeight:'500'}}>&nbsp;less than $10000 (12months):</span>&nbsp; {displayData.B19001_002E}</p>
              <p><span style={{fontWeight:'500'}}>&nbsp;less than $10000 - MoE:</span>&nbsp; {displayData.B19001_002M}</p>
              <p><span style={{fontWeight:'500'}}>$10,000 to $14,999:</span>&nbsp; {displayData.B19001_003E}</p>
              <p><span style={{fontWeight:'500'}}>$10,000 to $14,999 - MoE:</span>&nbsp; {displayData.B19001_003M}</p>
              <p><span style={{fontWeight:'500'}}>$15,000 to $19,999:</span>&nbsp; {displayData.B19001_004E}</p>
              <p><span style={{fontWeight:'500'}}>$15,000 to $19,999 - MoE:</span>&nbsp; {displayData.B19001_004M}</p>
              <p><span style={{fontWeight:'500'}}>$20,000 to $24,999:</span>&nbsp; {displayData.B19001_005E}</p>
              <p><span style={{fontWeight:'500'}}>$20,000 to $24,999 - MoE:</span>&nbsp; {displayData.B19001_005M}</p>
              <p><span style={{fontWeight:'500'}}>$25,000 to $29,999:</span>&nbsp; {displayData.B19001_006E}</p>
              <p><span style={{fontWeight:'500'}}>$25,000 to $29,999 - MoE:</span>&nbsp; {displayData.B19001_006M}</p>
              <p><span style={{fontWeight:'500'}}>$30,000 to $34,999:</span>&nbsp; {displayData.B19001_007E}</p>
              <p><span style={{fontWeight:'500'}}>$30,000 to $34,999 - MoE:</span>&nbsp; {displayData.B19001_007M}</p>
              <p><span style={{fontWeight:'500'}}>$35,000 to $39,999:</span>&nbsp; {displayData.B19001_008E}</p>
              <p><span style={{fontWeight:'500'}}>$35,000 to $39,999 - MoE:</span>&nbsp; {displayData.B19001_008M}</p>
              <p><span style={{fontWeight:'500'}}>$40,000 to $44,999:</span>&nbsp; {displayData.B19001_009E}</p>
              <p><span style={{fontWeight:'500'}}>$40,000 to $44,999 - MoE:</span>&nbsp; {displayData.B19001_009M}</p>
              <p><span style={{fontWeight:'500'}}>$45,000 to $49,999:</span>&nbsp; {displayData.B19001_010E}</p>
              <p><span style={{fontWeight:'500'}}>$45,000 to $49,999 - MoE:</span>&nbsp; {displayData.B19001_010M}</p>
              <p><span style={{fontWeight:'500'}}>$50,000 to $59,999:</span>&nbsp; {displayData.B19001_011E}</p>
              <p><span style={{fontWeight:'500'}}>$50,000 to $59,999 - MoE:</span>&nbsp; {displayData.B19001_011M}</p>
              <p><span style={{fontWeight:'500'}}>$60,000 to $74,999:</span>&nbsp; {displayData.B19001_012E}</p>
              <p><span style={{fontWeight:'500'}}>$60,000 to $74,999 - MoE:</span>&nbsp; {displayData.B19001_012M}</p>
              <p><span style={{fontWeight:'500'}}>$75,000 to $99,999:</span>&nbsp; {displayData.B19001_013E}</p>
              <p><span style={{fontWeight:'500'}}>$75,000 to $99,999 - MoE:</span>&nbsp; {displayData.B19001_013M}</p>
              <p><span style={{fontWeight:'500'}}>$100,000 to $124,999:</span>&nbsp; {displayData.B19001_014E}</p>
              <p><span style={{fontWeight:'500'}}>$100,000 to $124,999 - MoE:</span>&nbsp; {displayData.B19001_014M}</p>
              <p><span style={{fontWeight:'500'}}>$125,000 to $149,999:</span>&nbsp; {displayData.B19001_015E}</p>
              <p><span style={{fontWeight:'500'}}>$125,000 to $149,999 - MoE:</span>&nbsp; {displayData.B19001_015M}</p>
              <p><span style={{fontWeight:'500'}}>$150,000 to $199,999:</span>&nbsp; {displayData.B19001_016E}</p>
              <p><span style={{fontWeight:'500'}}>$150,000 to $199,999 - MoE:</span>&nbsp; {displayData.B19001_016M}</p>
              <p><span style={{fontWeight:'500'}}>$200,000 or more:</span>&nbsp; {displayData.B19001_017E}</p>
              <p><span style={{fontWeight:'500'}}>$200,000 or more - MoE:</span>&nbsp; {displayData.B19001_017M}</p>
              <p><span style={{fontWeight:'500'}}>less than $75,000:</span>&nbsp; {displayData.B19001_calc_numLT75E}</p>
              <p><span style={{fontWeight:'500'}}>less than $75,000 - MoE:</span>&nbsp; {displayData.B19001_calc_numLT75M}</p>
              <p><span style={{fontWeight:'500'}}>less than $75,000(%):</span>&nbsp; {parseFloat(displayData.B19001_calc_pctLT75E.toFixed(2))}</p>
              <p><span style={{fontWeight:'500'}}>less than $75,000 - MoE(%):</span>&nbsp; {parseFloat(displayData.B19001_calc_pctLT75M.toFixed(2))}</p>
              <p><span style={{fontWeight:'500'}}>$75,000 to $99,999(%):</span>&nbsp; {parseFloat(displayData.B19001_calc_pct7599E.toFixed(2))}</p>
              <p><span style={{fontWeight:'500'}}>$75,000 to $99,999 - MoE(%):</span>&nbsp; {parseFloat(displayData.B19001_calc_pct7599M.toFixed(2))}</p>
              <p><span style={{fontWeight:'500'}}>at least $100,000:</span>&nbsp; {displayData.B19001_calc_numGE100E}</p>
              <p><span style={{fontWeight:'500'}}>at least $100,000 - MoE:</span>&nbsp; {displayData.B19001_calc_numGE100M}</p>
              <p><span style={{fontWeight:'500'}}>at least $100,000(%):</span>&nbsp; {parseFloat(displayData.B19001_calc_pctGE100E.toFixed(2))}</p>
              <p><span style={{fontWeight:'500'}}>at least $100,000 - MoE(%):</span>&nbsp; {parseFloat(displayData.B19001_calc_pctGE100M.toFixed(2))}</p>
              {/* <p><span style={{fontWeight:'500'}}>Shape__Area:</span>&nbsp; {displayData.Shape__Area}</p>
              <p><span style={{fontWeight:'500'}}>Shape__Length:</span>&nbsp; {displayData.Shape__Length}</p> */}
              {/* <p><span style={{fontWeight:'500'}}>State:</span>&nbsp; {displayData.State}</p>
              <p><span style={{fontWeight:'500'}}>County:</span>&nbsp; {displayData.County}</p> */}
            </div>
          }

          {displayData && displayData.elevation &&
            <div style={{lineHeight:'30px', marginLeft:'15px', fontWeight:'400'}}>
              <p><span style={{fontWeight:'500'}}>Elevation:</span>&nbsp; {displayData.elevation} (m)</p>
            </div>
          }

          {/* <pre>{JSON.stringify(displayData, null, 2)}</pre> */}
        </Sidebar>
      </div>
    </section>
  );
}