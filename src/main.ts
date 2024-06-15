import './style.css'; // CSSファイルのimport
// MapLibre GL JSの読み込み
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// OpacityControlプラグインの読み込み
import OpacityControl from 'maplibre-gl-opacity';
import 'maplibre-gl-opacity/dist/maplibre-gl-opacity.css';

//import shelterPointData from './shelter_point.json'; // 避難所データの読み込み
import hazardLegendData from './hazard_legend.json'; // 凡例データの読み込み
//import communityBorderData from './community_border.json' // 上青木西町会境界線

// maplibre-gl-gsi-terrainの読み込み
import { useGsiTerrainSource } from 'maplibre-gl-gsi-terrain';
const gsiTerrainSource = useGsiTerrainSource(maplibregl.addProtocol);

// @mapbox/tilebeltの読み込み
import tilebelt from '@mapbox/tilebelt';

// chroma.jsの読み込み
import chroma from 'chroma-js';

// 型の読み込み
import type { Popup, RasterSourceSpecification, RasterLayerSpecification } from 'maplibre-gl';

// 凡例データの型定義
type HazardLegend = {
    id: string;
    name: string;
    guide_color: {
        color: string;
        label: string;
    }[];
};

// 地図の表示
const map = new maplibregl.Map({
    container: 'map',
    style: {
        version: 8,
        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
        sources: {
            terrain: gsiTerrainSource, // 地形ソース
            pales: {
                // ソースの定義
                type: 'raster', // データタイプはラスターを指定
                tiles: ['https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png'], // タイルのURL
                tileSize: 256, // タイルのサイズ
                maxzoom: 18, // 最大ズームレベル
                attribution: "<a href='https://www.gsi.go.jp/' target='_blank'>国土地理院</a>", // 地図上に表示される属性テキスト
            },
            osm: {
                // Open Street Map
                type: 'raster',
                tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                tileSize: 256,
                maxzoom: 19,
                attribution:
                    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            },
            seamlessphoto: {
                // 全国最新写真
                type: 'raster',
                tiles: ['https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg'],
                tileSize: 256,
                attribution: "<a href='https://www.gsi.go.jp/' target='_blank'>国土地理院</a>",
                maxzoom: 18,
            },
            skhb: {
                // 指定緊急避難場所ベクトルタイル
                type: 'vector',
                tiles: [
                    `${location.href.replace(
                        '/index.html',
                        '',
                    )}/skhb/{z}/{x}/{y}.pbf`,
                ],
                minzoom: 5,
                maxzoom: 8,
                attribution:
                    '<a href="https://www.gsi.go.jp/bousaichiri/hinanbasho.html" target="_blank">国土地理院:指定緊急避難場所データ</a>',
            },
            flood: {
                // 洪水浸水想定区域（想定最大規模）
                type: 'raster',
                tiles: ['https://disaportaldata.gsi.go.jp/raster/01_flood_l2_shinsuishin_data/{z}/{x}/{y}.png'],
                minzoom: 2,
                maxzoom: 17,
                tileSize: 256,
                attribution: "<a href='https://disaportal.gsi.go.jp/hazardmap/copyright/opendata.html' target='_blank'>ハザードマップポータルサイト</a>",
            },
            hightide: {
                // 高潮浸水想定区域
                type: 'raster',
                tiles: ['https://disaportaldata.gsi.go.jp/raster/03_hightide_l2_shinsuishin_data/{z}/{x}/{y}.png'],
                minzoom: 2,
                maxzoom: 17,
                tileSize: 256,
                attribution: "<a href='https://disaportal.gsi.go.jp/hazardmap/copyright/opendata.html' target='_blank'>ハザードマップポータルサイト</a>",
            },
            tsunami: {
                // 津波浸水想定
                type: 'raster',
                tiles: ['https://disaportaldata.gsi.go.jp/raster/04_tsunami_newlegend_data/{z}/{x}/{y}.png'],
                minzoom: 2,
                maxzoom: 17,
                tileSize: 256,
                attribution: "<a href='https://disaportal.gsi.go.jp/hazardmap/copyright/opendata.html' target='_blank'>ハザードマップポータルサイト</a>",
            },
            doseki: {
                // 土砂災害警戒区域（土石流）
                type: 'raster',
                tiles: ['https://disaportaldata.gsi.go.jp/raster/05_dosekiryukeikaikuiki/{z}/{x}/{y}.png'],
                minzoom: 2,
                maxzoom: 17,
                tileSize: 256,
                attribution: '<a href="https://disaportal.gsi.go.jp/hazardmap/copyright/opendata.html">ハザードマップポータルサイト</a>',
            },
            kyukeisha: {
                // 土砂災害警戒区域（急傾斜地の崩壊）
                type: 'raster',
                tiles: ['https://disaportaldata.gsi.go.jp/raster/05_kyukeishakeikaikuiki/{z}/{x}/{y}.png'],
                minzoom: 2,
                maxzoom: 17,
                tileSize: 256,
                attribution: '<a href="https://disaportal.gsi.go.jp/hazardmap/copyright/opendata.html">ハザードマップポータルサイト</a>',
            },
            jisuberi: {
                // 土砂災害警戒区域（地すべり）
                type: 'raster',
                tiles: ['https://disaportaldata.gsi.go.jp/raster/05_jisuberikeikaikuiki/{z}/{x}/{y}.png'],
                minzoom: 2,
                maxzoom: 17,
                tileSize: 256,
                attribution: '<a href="https://disaportal.gsi.go.jp/hazardmap/copyright/opendata.html">ハザードマップポータルサイト</a>',
            },
//            shelter: {
//                type: 'geojson', // データタイプはgeojsonを指定
//                data: shelterPointData,
//                attribution: '<a href="https://www.bousai.metro.tokyo.lg.jp/bousai/1000026/1000316.html" target="_blank">東京都避難所、避難場所データ オープンデータ</a>',
//                cluster: true, // クラスタリングの有効化
//                clusterMaxZoom: 12, // クラスタリングを開始するズームレベル
//                clusterRadius: 50, // クラスタリングの半径
//            },
            
             community: {
                type: 'geojson',
                    data: {
                           type: 'Feature',
                    geometry: {
                    type: 'LineString',
                    coordinates: [
                        [139.710454,35.828449],
                        [139.71108,35.82825],
                        [139.71208,35.82789],
                        [139.71235,35.82769],
                        [139.71305,35.82720],
                        [139.71320,35.82695],
                        [139.71332,35.82694],
                        [139.71374,35.82681],
                        [139.71445,35.82648],
                        [139.71530,35.82626],
                        [139.71542,35.82620],
                        [139.71545,35.82609],
                        [139.71573,35.82607],
                        [139.71728,35.82563],
                        [139.71724,35.82342],
                        [139.71375,35.82339],
                        [139.71226,35.82335],
                        [139.71215,35.82344],
                        [139.71212,35.82359],
                        [139.70975,35.82356],
                        [139.70988,35.82504],
                        [139.71114,35.82497],
                        [139.71114,35.82619],
                        [139.71004,35.82624],
                        [139.71014,35.82658],
                        [139.710454,35.828449],
                    ]
                    },
                     }
            
            },
  
            gsi_vector: {
                // 地理院ベクトル 建物表示用
                type: 'vector',
                tiles: ['https://cyberjapandata.gsi.go.jp/xyz/experimental_bvmap/{z}/{x}/{y}.pbf'],
                maxzoom: 16,
                minzoom: 4,
                attribution: "<a href='https://www.gsi.go.jp/' target='_blank'>国土地理院</a>",
            },
   
        },
        layers: [
            {   // 地理院タイル
                id: 'pales_layer', // レイヤーのID
                source: 'pales', // ソースのID
                type: 'raster', // データタイプはラスターを指定
                layout: { visibility: 'none' }, // 初期状態を非表示にする（ほかのラスターレイヤーも同様）
            },
            {   // Open Street MAP
                id: 'osm_layer',
                source: 'osm',
                type: 'raster',
                layout: { visibility: 'none' },
            },
            {   // 全国最新写真のレイヤーを表示
                id: 'seamlessphoto_layer',
                source: 'seamlessphoto',
                type: 'raster',
                layout: { visibility: 'none' },
            },
            {   // マスクレイヤー
                id: 'background',
                type: 'background',
                paint: {
                    'background-color': '#000', // レイヤーの色を設定
                    'background-opacity': 0.3, // 不透明度を設定
                },
            },
            {
                id: 'flood_layer', // 洪水浸水想定区域（想定最大規模）
                source: 'flood',
                type: 'raster',
                paint: { 'raster-opacity': 0.7 },
                layout: { visibility: 'none' },
            },
            {
                id: 'hightide_layer', // 高潮浸水想定区域
                source: 'hightide',
                type: 'raster',
                paint: { 'raster-opacity': 0.7 },
                layout: { visibility: 'none' },
            },
            {
                id: 'tsunami_layer', // 津波浸水想定
                source: 'tsunami',
                type: 'raster',
                paint: { 'raster-opacity': 0.7 },
                layout: { visibility: 'none' },
            },
            {
                // 土砂災害警戒区域（土石流）
                id: 'doseki_layer',
                source: 'doseki',
                type: 'raster',
                paint: { 'raster-opacity': 0.7 },
                layout: { visibility: 'none' },
            },
            {
                // 土砂災害警戒区域（急傾斜地の崩壊）
                id: 'kyukeisha_layer',
                source: 'kyukeisha',
                type: 'raster',
                paint: { 'raster-opacity': 0.7 },
                layout: { visibility: 'none' },
            },
            {
                // 土砂災害警戒区域（地すべり）
                id: 'jisuberi_layer',
                source: 'jisuberi',
                type: 'raster',
                paint: { 'raster-opacity': 0.7 },
                layout: { visibility: 'none' },
            },
            {   // 神青木西町会区域線
                id: 'community_layer',
                source: 'community',
                type: 'line',
                paint: {
                    'line-color': '#33aaff',
                    'line-width': 4,
                   },
                layout: { visibility: 'none' },
            },
            {   // 立体建物レイヤー
                id: 'building_layer',
                source: 'gsi_vector',
                'source-layer': 'building',
                type: 'fill-extrusion',
                minzoom: 13,
                maxzoom: 18,
                paint: {
                    'fill-extrusion-color': '#BEE6FF',
                    'fill-extrusion-height': [
                        'match', // 建物の種類によって高さを変える
                        ['get', 'ftCode'], // ftCodeで建物の種類を区別する
                        3101,
                        10, // 普通建物
                        3102,
                        40, // 堅ろう建物
                        3103,
                        100, // 高層建物
                        3111,
                        10, // 普通無壁舎
                        3112,
                        40, // 堅ろう無壁舎
                        10,
                    ], // その他
                    'fill-extrusion-opacity': 0.4,
                },
                layout: { visibility: 'visible' },
            },
             
//            {
//                id: 'clusters', // クラスター
//                source: 'shelter',
//                type: 'circle',
//                filter: ['has', 'point_count'], // クラスターに含まれるポイントのみ表示
//                paint: {
//                    'circle-color': '#0BB1AF', // クラスターの色
//                    'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40], // クラスターのポイント数に応じてサイズを変更
//                    'circle-blur': 0.3, // クラスターのぼかし
//                },
//            },
//            {
//                id: 'cluster-count', // クラスターのポイントの数
//                source: 'shelter',
//                type: 'symbol',
//                filter: ['has', 'point_count'], // クラスターに含まれるポイントのみ表示
//                layout: {
//                    'text-field': '{point_count_abbreviated}', // クラスターのポイント数を表示
//                    'text-size': 12, // テキストのサイズ
//                },
//                paint: {
//                    'text-color': '#FFF',
//                },
//            },
//            {
//                id: 'shelter_point',
//                source: 'shelter',
//                type: 'circle', // ポイントデータを表示するためにcircleを指定
//                filter: ['!', ['has', 'point_count']], // クラスターに含まれないポイントのみ表示
//                paint: {
//                    'circle-color': '#0BB1AF', // ポイントの色
//                    'circle-radius': 8, // ポイントのサイズ
//                    'circle-stroke-width': 2, // ポイントの枠線の太さ
//                    'circle-stroke-color': '#FFF', // ポイントの枠線の色
//                },
//            },
            
            // 指定緊急避難場所ここから
            {   // 洪水
                id: 'skhb1_layer',
                source: 'skhb',
                'source-layer': 'skhb',
                type: 'circle',
                paint: {
                    'circle-color': '#6666cc',
                    'circle-radius': [
                        // ズームレベルに応じた円の大きさ
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        5,
                        2,
                        14,
                        6,
                    ],
                    'circle-stroke-width': 1,
                    'circle-stroke-color': '#ffffff',
                },
                filter: ['get', 'disaster1'], // 属性:disaster1がtrueの地物のみ表示する
                layout: { visibility: 'visible' }, // visible　| none レイヤーの表示はOpacityControlで操作するためデフォルトで非表示にしておく
            },
            {   // 崖崩れ/土石流/地滑り
                id: 'skhb2_layer',
                source: 'skhb',
                'source-layer': 'skhb',
                type: 'circle',
                paint: {
                    'circle-color': '#6666cc',
                    'circle-radius': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        5,
                        2,
                        14,
                        6,
                    ],
                    'circle-stroke-width': 1,
                    'circle-stroke-color': '#ffffff',
                },
                filter: ['get', 'disaster2'],
                layout: { visibility: 'visible' },
            },
            {   // 高潮
                id: 'skhb3_layer',
                source: 'skhb',
                'source-layer': 'skhb',
                type: 'circle',
                paint: {
                    'circle-color': '#6666cc',
                    'circle-radius': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        5,
                        2,
                        14,
                        6,
                    ],
                    'circle-stroke-width': 1,
                    'circle-stroke-color': '#ffffff',
                },
                filter: ['get', 'disaster3'],
                layout: { visibility: 'visible' },
            },
            {   // 地震
                id: 'skhb4_layer',
                source: 'skhb',
                'source-layer': 'skhb',
                type: 'circle',
                paint: {
                    'circle-color': '#6666cc',
                    'circle-radius': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        5,
                        2,
                        14,
                        6,
                    ],
                    'circle-stroke-width': 1,
                    'circle-stroke-color': '#ffffff',
                },
                filter: ['get', 'disaster4'],
                layout: { visibility: 'visible' },
            },
            {   // 津波
                id: 'skhb5_layer',
                source: 'skhb',
                'source-layer': 'skhb',
                type: 'circle',
                paint: {
                    'circle-color': '#6666cc',
                    'circle-radius': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        5,
                        2,
                        14,
                        6,
                    ],
                    'circle-stroke-width': 1,
                    'circle-stroke-color': '#ffffff',
                },
                filter: ['get', 'disaster5'],
                layout: { visibility: 'visible' },
            },
            {   // 大規模な火事
                id: 'skhb6_layer',
                source: 'skhb',
                'source-layer': 'skhb',
                type: 'circle',
                paint: {
                    'circle-color': '#6666cc',
                    'circle-radius': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        5,
                        2,
                        14,
                        6,
                    ],
                    'circle-stroke-width': 1,
                    'circle-stroke-color': '#ffffff',
                },
                filter: ['get', 'disaster6'],
                layout: { visibility: 'visible' },
            },
            {   // 内水氾濫
                id: 'skhb7_layer',
                source: 'skhb',
                'source-layer': 'skhb',
                type: 'circle',
                paint: {
                    'circle-color': '#6666cc',
                    'circle-radius': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        5,
                        2,
                        14,
                        6,
                    ],
                    'circle-stroke-width': 1,
                    'circle-stroke-color': '#ffffff',
                },
                filter: ['get', 'disaster7'],
                layout: { visibility: 'visible' },
            },
            {   // 火山現象
                id: 'skhb8_layer',
                source: 'skhb',
                'source-layer': 'skhb',
                type: 'circle',
                paint: {
                    'circle-color': '#6666cc',
                    'circle-radius': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        5,
                        2,
                        14,
                        6,
                    ],
                    'circle-stroke-width': 1,
                    'circle-stroke-color': '#ffffff',
                },
                filter: ['get', 'disaster8'],
                layout: { visibility: 'visible' },
            },

        ],
    },
    center: [139.71353, 35.82530], // 地図の中心座標
    zoom: 16, // 地図の初期ズームレベル
    maxZoom: 17.99, // 地図の最大ズームレベル
});

// 表示している災害情報レイヤーのID
let activeHazardId: string | undefined;

// ポップアップの定義
let popup: Popup | undefined;

// カラーガイドの切り替え
const updatedLegend = (layerId: string) => {
    // 表示している災害情報レイヤーのIDを更新
    activeHazardId = layerId;

    // JSONから凡例ラベルを取得
    const guideColor = hazardLegendData.find((data) => data.id === layerId)?.guide_color;
    if (!guideColor) {
        // TODO 凡例を非表示にする
        const legendDiv = document.querySelector('#hazard-legend');
        if (!legendDiv) return;
        
        (legendDiv as HTMLInputElement).style.display = 'none';
        
        return;
    }

    // カラーガイドを表示する要素を取得
    const legendDiv = document.querySelector('#hazard-legend');
    if (!legendDiv) return;
    
    (legendDiv as HTMLInputElement).style.display = 'block';
    
    // カラーガイドを変更
    legendDiv.innerHTML = guideColor.map((item) => `<div class='label' style='background:${item.color};'>${item.label}</div>`).join('');

    // ポップアップが表示されている場合は削除
    popup && popup.remove();
};

/**
 * 現在選択されている指定緊急避難場所レイヤー(skhb)を特定しそのfilter条件を返す
 */
/*
const getCurrentSkhbLayerFilter = () => {
    const style = map.getStyle(); // style定義を取得
    const skhbLayers = style.layers.filter((layer) =>
        // `skhb`から始まるlayerを抽出
        layer.id.startsWith('skhb'),
    );
    const visibleSkhbLayers = skhbLayers.filter(
        // 現在表示中のレイヤーを見つける
        (layer) => layer.layout.visibility === 'visible',
    );
    return visibleSkhbLayers[0].filter; // 表示中レイヤーのfilter条件を返す
};
*/
/**
 * 経緯度を渡すと最寄りの指定緊急避難場所を返す
 */
/*
const getNearestFeature = (longitude, latitude) => {
    // 現在表示中の指定緊急避難場所のタイルデータ（＝地物）を取得する
    const currentSkhbLayerFilter = getCurrentSkhbLayerFilter();
    const features = map.querySourceFeatures('skhb', {
        sourceLayer: 'skhb',
        filter: currentSkhbLayerFilter,
    });
*/
    // 現在地に最も近い地物を見つける
/*
const nearestFeature = features.reduce((minDistFeature, feature) => {
        const dist = distance(
            [longitude, latitude],
            feature.geometry.coordinates,
        );
        if (minDistFeature === null || minDistFeature.properties.dist > dist)
            return {
                ...feature,
                properties: {
                    ...feature.properties,
                    dist,
                },
            };
        return minDistFeature;
    }, null);

    return nearestFeature;
};
*/
// マップの初期ロード完了時に発火するイベント
map.on('load', () => {
    map.addLayer(
        // hillshade レイヤー
        {
            id: 'hillshade',
            source: 'terrain', // 地形ソースを指定
            type: 'hillshade',
            paint: {
                'hillshade-illumination-anchor': 'map', // 陰影の光源は地図の北を基準にする
                'hillshade-exaggeration': 0.3, // 陰影の強さ
            },
        },
        'background', // マスクレイヤーの下に追加（対象のレイヤーidを指定する）
    );

    // 背景地図の切り替えコントロール
    const baseMaps = new OpacityControl({
                             baseLayers: {
                                 // コントロールに表示するレイヤーの定義
                                 pales_layer: '淡色地図',
                                 osm_layer: 'OSマップ',
                                 seamlessphoto_layer: '空中写真',
                             },
                             overLayers:{
                                 community_layer: '上青木西町会',
                             }});
    map.addControl(baseMaps, 'top-left'); // 第二引数でUIの表示場所を定義

    // 災害情報レイヤーの切り替えコントロール
    const hazardLayers = new OpacityControl({
        baseLayers: {
            building_layer: '避難所のみ',
            flood_layer: '洪水浸水想定区域',
            hightide_layer: '高潮浸水想定区域',
            tsunami_layer: '津波浸水想定',
            doseki_layer: '土石流警戒',
            kyukeisha_layer: '急傾斜地警戒',
            jisuberi_layer: '地滑り警戒',
            skhb4_layer: '地震緊急避難所',
            skhb6_layer: '大規模な火事避難',
            skhb8_layer: '火山緊急避難所'
        },
    });
    map.addControl(hazardLayers, 'top-left');

    // 凡例表示切り替え
    const hazardControl: HTMLInputElement = hazardLayers._container;
    hazardControl.querySelectorAll<HTMLInputElement>('input[type="radio"]').forEach((radio) => {
        if (radio.checked) updatedLegend(radio.id); // 書き換え
        radio.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement;
            if (target.checked) updatedLegend(target.id); // 書き換え
        });
    });

    // TerrainControlの追加
/*    map.addControl(
        new maplibregl.TerrainControl({
           source: 'terrain', // 地形ソースを指定
            exaggeration: 1, // 高さの倍率
    }),
        'top-right', // コントロールの位置を指定
    );
*/
    // 3D切り替え
    //const terrainComtrol = document.querySelector('.maplibregl-ctrl-terrain');
    //terrainComtrol?.addEventListener('click', () => {
        // 地形が３D表示になっている時は地図を60度傾ける。そうでない時は0度にする。
    //    map.getTerrain() ? map.easeTo({ pitch: 60 }) : map.easeTo({ pitch: 0 });
    //});

    // ナビゲーションコントロールの追加
    map.addControl(new maplibregl.NavigationControl({}), 'top-right'); // 画面右上に追加


    // 現在位置取得の機能
    const geolocationControl = new maplibregl.GeolocateControl({trackUserLocation: true, })
    // 現在地ボタン追加
    map.addControl(geolocationControl, 'top-right');
    // スケールバーの追加
    map.addControl(
        new maplibregl.ScaleControl({
            maxWidth: 200, // スケールの最大幅
            unit: 'metric', // 単位
        }),
        'bottom-right',
    );
    // マップのクリックイベント
    map.on('click', (e) => {
        // クリック箇所に指定緊急避難場所レイヤーが存在するかどうかをチェック
        const features = map.queryRenderedFeatures(e.point, {
            layers: [
                'skhb1_layer',
                'skhb2_layer',
                'skhb3_layer',
                'skhb4_layer',
                'skhb5_layer',
                'skhb6_layer',
                'skhb7_layer',
                'skhb8_layer',
            ],
        });
        
        if (features.length === 0) {
            // 避難所の地物がない場合は、災害情報レイヤーのクリックイベントを発火
            rasterClick(e.lngLat.lng, e.lngLat.lat);
            return;
        }
        
        // 地物があればポップアップを表示する
        const feature = features[0]; // 複数の地物が見つかっている場合は最初の要素を用いる
        const popup = new maplibregl.Popup();
        //popup.setLngLat(feature.geometry.coordinates) // [lon, lat]
        popup.setLngLat([e.lngLat.lng, e.lngLat.lat])
            // 名称・住所・備考・対応している災害種別を表示するよう、HTMLを文字列でセット
            .setHTML(
                `\
        <div style="font-weight:900; font-size: 1.2rem;">${
            feature.properties.name
        }</div>\
        <div>${feature.properties.address}</div>\
        <div>${feature.properties.remarks ?? ''}</div>\
        <div>\
        <span${
            feature.properties.disaster1 ? '' : ' style="color:#ccc;"'
        }">洪水</span>\
        <span${
            feature.properties.disaster2 ? '' : ' style="color:#ccc;"'
        }> 崖崩れ/土石流/地滑り</span>\
        <span${
            feature.properties.disaster3 ? '' : ' style="color:#ccc;"'
        }> 高潮</span>\
        <span${
            feature.properties.disaster4 ? '' : ' style="color:#ccc;"'
        }> 地震</span>\
        <div>\
        <span${
            feature.properties.disaster5 ? '' : ' style="color:#ccc;"'
        }>津波</span>\
        <span${
            feature.properties.disaster6 ? '' : ' style="color:#ccc;"'
        }> 大規模な火事</span>\
        <span${
            feature.properties.disaster7 ? '' : ' style="color:#ccc;"'
        }> 内水氾濫</span>\
        <span${
            feature.properties.disaster8 ? '' : ' style="color:#ccc;"'
        }> 火山現象</span>\
        </div>`,
            )
            .setMaxWidth('400px')
            .addTo(map);
    });

    // マウスカーソルのスタイルを変更
    // 地図上でマウスが移動した際のイベント
    map.on('mousemove', (e) => {
        // マウスカーソル以下に指定緊急避難場所レイヤーが存在するかどうかをチェック
        const features = map.queryRenderedFeatures(e.point, {
            layers: [
                'skhb1_layer',
                'skhb2_layer',
                'skhb3_layer',
                'skhb4_layer',
                'skhb5_layer',
                'skhb6_layer',
                'skhb7_layer',
                'skhb8_layer',
            ],
        });
        if (features.length > 0) {
            // 地物が存在する場合はカーソルをpointerに変更
            map.getCanvas().style.cursor = 'pointer';
        } else {
            // 存在しない場合はデフォルト
            map.getCanvas().style.cursor = '';
        }
    });

});

// 凡例から最も近いラベルを取得
const getGuide = (targetColor: string, guideColors: HazardLegend['guide_color']) => {
    const closest = guideColors
        .map((item) => {
            // 各色のユークリッド距離を計算
            const distance = chroma.distance(targetColor, item.color);
            return { distance, color: item.color, label: item.label };
        })
        .sort((a, b) => a.distance - b.distance)[0]; // 距離が近い順にソートし、最初の要素を取得
    return { color: closest.color, label: closest.label };
};

// 型定義
type BBOX = [number, number, number, number];
type RGBA = [number, number, number, number];

const getPixelColor = (lng: number, lat: number, bbox: BBOX, url: string): Promise<RGBA> => {
    // クリックした座標がらタイル画像のピクセル座標を計算
    const [lngMin, latMin, lngMax, latMax] = bbox;
    const x = ((lng - lngMin) / (lngMax - lngMin)) * 256;
    const y = ((latMax - lat) / (latMax - latMin)) * 256;

    // タイル画像を読み込み、ピクセル座標の色を返す
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = url;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            const pixel = ctx?.getImageData(x, y, 1, 1).data;
            if (!pixel) return;
            const [r, g, b, a] = [...pixel];
            resolve([r, g, b, a / 255]);
        };
    });
};

// 災害情報レイヤーのクリックイベント
const rasterClick = async (lng: number, lat: number) => {
    // ズームレベルを取得
    const zoom = Math.min(Math.round(map.getZoom()), 17);
    const tile = tilebelt.pointToTile(lng, lat, zoom);
    const bbox = tilebelt.tileToBBOX(tile);

    // クリックしたレイヤーのソースを取得
    const layer = map.getStyle().layers.find((layer) => layer.id === activeHazardId) as RasterLayerSpecification;
    const source = map.getSource(layer.source) as RasterSourceSpecification;
    if (!source || !source.tiles) return;

    // 地図タイルのURLを取得
    const url = source.tiles[0].replace('{z}', tile[2].toString()).replace('{x}', tile[0].toString()).replace('{y}', tile[1].toString());

    // クリックしたタイルの色を取得
    const [r, g, b, a] = await getPixelColor(lng, lat, bbox, url);

    // 透明色の場合は処理を終了
    if (a === 0) return;

    // JSONから表示中の災害情報レイヤーの凡例を取得
    const legend = hazardLegendData.find((data) => data.id === activeHazardId) as HazardLegend;

    // クリックして取得した色から一致する凡例ラベルを取得
    const guide = getGuide(`rgba(${r},${g},${b},${a})`, legend.guide_color);

    // ポップアップを表示
    const html = `<div>${legend.name}</div><h2 style='margin-bottom:0;'>${guide.label}</h2><div style='background:${guide.color}; padding:6px;'></div>`;
    popup = new maplibregl.Popup({
        offset: [0, -45],
    })
        .setLngLat([lng, lat])
        .setHTML(html)
        .addTo(map);

    // マーカーを表示
    const marker = new maplibregl.Marker().setLngLat([lng, lat]).addTo(map);

    /// ポップアップが閉じられたときにマーカーを削除する;
    popup.on('close', () => {
        if (marker) marker?.remove();
    });
};


