import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import Plot from 'react-plotly.js';
import Table from './TableComponents/Table';
import { colors } from '../../../../styles/data_vis_colors';

const { background_color } = colors;

const mapStateToProps = (state, ownProps) => {
  const { office } = ownProps;
  return {
    timeSeriesData: state.vizReducer.offices[office].timeSeriesData,
  };
};

function TimeSeriesSingleOffice(props) {
  const { office, timeSeriesData } = props;
  const currentYear = new Date().getFullYear();
  const [plotlyGraphAxis, setPlotlyGraphAxis] = useState({
    x: [2015, currentYear],
    y: [],
  });
  const [rowsForTable, setRowsForTable] = useState([]);

  useEffect(() => {
    if (timeSeriesData['singleOfficeDataObject'] !== undefined) {
      setPlotlyGraphAxis({
        x: timeSeriesData['singleOfficeDataObject']['xYears'],
        y: timeSeriesData['singleOfficeDataObject']['yTotalPercentGranteds'],
      });
    } else {
      setPlotlyGraphAxis({ x: [2015, currentYear], y: [] });
    }
    if (timeSeriesData.rowsForTable === undefined) {
      setRowsForTable([]);
    } else {
      setRowsForTable(timeSeriesData.rowsForTable);
    }
  }, [timeSeriesData, currentYear]);

  const columnsForTable = [
    'Fiscal Year',
    'Total Cases',
    'Grants',
    'Referrals / Denials',
    'Admin Closed / Dismissal',
    'Granted Rate',
  ];
  return (
    <div
      className="time-series-single-office-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100px',
      }}
    >
      <p>Showing: Time series data for all USCIS Asylum Offices - ({office})</p>
      <Plot
        data={[
          {
            x: plotlyGraphAxis['x'],
            y: plotlyGraphAxis['y'],
            type: 'scatter',
            mode: 'lines+markers',
            yMax: 1,
            dy: 1,
            dx: 1, // setting these explicitly so they are easy to change later
          },
        ]}
        layout={{
          title: `Asylum Grant Rate for the ${office} Asylum Office Over Time`,
          height: 500,
          width: 700,
          yaxis: {
            range: [0, 100],
            title: `Asylum Grant Rate %`,
            autotick: false,
            dtick: 10,
          },
          xaxis: {
            range: [
              plotlyGraphAxis['x'][0],
              plotlyGraphAxis['x'][plotlyGraphAxis['x'].length - 1],
            ],
            title: `Fiscal Year`,
          },
          paper_bgcolor: background_color,
          hoverlabel: {
            bordercolor: background_color,
          },
        }}
      />
      <p>Table view</p>
      <Table
        columns={columnsForTable}
        rows={rowsForTable}
        tableWidth={'100%'}
        rowHeight={'50px'}
      />
    </div>
  );
}

export default connect(mapStateToProps)(TimeSeriesSingleOffice);
