import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import Plot from 'react-plotly.js';
import Table from './TableComponents/Table';
import { colors } from '../../../../styles/data_vis_colors';

const { background_color } = colors;

const mapStateToProps = state => {
  return {
    officeHeatMapData: state.vizReducer.officeHeatMapData,
  };
};

function OfficeHeatMap(props) {
  const { officeHeatMapData } = props;
  const [plotlyGraphAxis, setPlotlyGraphAxis] = useState({
    x: [],
    y: [],
    z: [],
  });
  const [rowsForTable, setRowsForTable] = useState([]);

  useEffect(() => {
    if (officeHeatMapData['officeHeatMapDataObject'] !== undefined) {
      setPlotlyGraphAxis({
        x: officeHeatMapData['officeHeatMapDataObject']['x'],
        y: officeHeatMapData['officeHeatMapDataObject']['y'],
        z: officeHeatMapData['officeHeatMapDataObject']['z'],
      });
    } else {
      setPlotlyGraphAxis({ x: [], y: [], z: [] });
    }
    if (officeHeatMapData.rowsForTable === undefined) {
      setRowsForTable([]);
    } else {
      setRowsForTable(officeHeatMapData.rowsForTable);
    }
  }, [officeHeatMapData]);

  const columnsForTable = [
    'Year [Office]',
    'Total Cases',
    'Grants',
    'Referrals / Denials',
    'Admin Closed / Dismissals',
    'Granted Rate',
  ];

  return (
    <div
      className="office-heat-map-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100px',
        justifyContent: 'center',
      }}
    >
      <p>Showing: Rates of 'granted' case decision by asylum office, by year</p>
      <Plot
        data={[
          {
            x: plotlyGraphAxis['x'],
            y: plotlyGraphAxis['y'],
            z: plotlyGraphAxis['z'],
            colorscale: [
              ['0.0', 'rgb(165,0,38)'],
              ['0.111111111111', 'rgb(215,48,39)'],
              ['0.222222222222', 'rgb(244,109,67)'],
              ['0.333333333333', 'rgb(253,174,97)'],
              ['0.444444444444', 'rgb(254,224,144)'],
              ['0.555555555556', 'rgb(224,243,248)'],
              ['0.666666666667', 'rgb(171,217,233)'],
              ['0.777777777778', 'rgb(116,173,209)'],
              ['0.888888888889', 'rgb(69,117,180)'],
              ['1.0', 'rgb(49,54,149)'],
            ],
            type: 'heatmap',
          },
        ]}
        layout={{
          title: 'USCIS Asylum Office Grant Rates by Year and Office',
          height: 500,
          width: 700,
          paper_bgcolor: background_color,
          hoverlabel: {
            bordercolor: background_color,
          },
        }}
      />
      <p>Table view</p>
      <Table
        rows={rowsForTable}
        columns={columnsForTable}
        tableWidth={'100%'}
        rowHeight={'50px'}
      />
    </div>
  );
}

export default connect(mapStateToProps)(OfficeHeatMap);
