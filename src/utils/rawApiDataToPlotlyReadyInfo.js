const rawApiDataToPlotlyReadyInfo = (view, office, data) => {
  const officeNames = [
    'Los Angeles, CA',
    'San Francisco, CA',
    'New York, NY',
    'Houston, TX',
    'Chicago, IL',
    'Newark, NJ',
    'Arlington, VA',
    'Boston, MA',
    'Miami, FL',
    'New Orleans, LA',
  ];
  let rowItem;
  let rowsForTable;

  let yearMinMax = []; //variable to set minYear and MaxYear
  for (let yearResults of data[0]['yearResults']) {
    yearMinMax.push(yearResults['fiscal_year']);
  }

  const yearByOfficeByGrant = {}; //Object that contacts year by Office by grant rate information
  for (let office of data[0]['yearResults']) {
    if (!yearByOfficeByGrant[office['fiscal_year']])
      yearByOfficeByGrant[office['fiscal_year']] = {}; //if year not existing set to empty object
    for (let yearData of office['yearData']) {
      yearByOfficeByGrant[office['fiscal_year']][yearData['office']] = {
        //assign rates to year:{office:{}}
        granted: yearData['granted'],
        adminClosed: yearData['adminClosed'],
        denied: yearData['denied'],
      };
    }
  }

  const officeData = {}; //object that holds each % as a key of array value
  for (let officeName of officeNames) {
    officeData[officeName] = {
      xYears: [],
      totals: [],
      yTotalPercentGranteds: [],
      totalPercentAdminCloseds: [],
      totalPercentDenieds: [],
    };
  }
  for (let yearResults of data[0]['yearResults']) {
    for (let yearData of yearResults['yearData']) {
      officeData[yearData['office']]['xYears'].push(yearResults['fiscal_year']);
      officeData[yearData['office']]['totals'].push(yearData['totalCases']);
      officeData[yearData['office']]['yTotalPercentGranteds'].push(
        yearData['granted']
      );
      officeData[yearData['office']]['totalPercentAdminCloseds'].push(
        yearData['adminClosed']
      );
      officeData[yearData['office']]['totalPercentDenieds'].push(
        yearData['denied']
      );
    }
  }

  if (!office || office === 'all') {
    switch (view) {
      case 'time-series':
        const rowsForAllDisplay = [];
        for (let yearResults of data[0].yearResults) {
          rowItem = {
            'Fiscal Year': yearResults.fiscal_year,
            'Total Cases': Number(yearResults.totalCases).toLocaleString(),
            Grants: Number(yearResults.totalGranted).toLocaleString(),
            'Referrals / Denials': Number(yearResults.denied).toLocaleString(),
            'Admin Closed / Dismissal': Number(
              yearResults.adminClosed
            ).toLocaleString(),
            'Granted Rate': Number(yearResults.granted).toFixed(2),
          };
          rowsForAllDisplay.push(rowItem);
        }

        const finalData = {
          xYears: [],
          totals: [],
          yTotalPercentGranteds: [],
          totalPercentAdminCloseds: [],
          totalPercentDenieds: [],
        };
        for (let officeName of data[0]['yearResults']) {
          finalData['xYears'].push(officeName['fiscal_year']);
          finalData['totals'].push(officeName['totalCases']);
          finalData['yTotalPercentGranteds'].push(officeName['granted']);
          finalData['totalPercentAdminCloseds'].push(officeName['adminClosed']);
          finalData['totalPercentDenieds'].push(officeName['denied']);
        }

        return { ...finalData, rowsForAllDisplay, officeData };

      case 'office-heat-map':
        rowsForTable = [];
        for (let yearResults of data[0].yearResults) {
          for (let officeKey of officeNames) {
            if (
              yearResults.yearData.filter(
                yearItem => yearItem.office === officeKey
              ).length > 0
            ) {
              rowItem = {
                'Year [Office]':
                  String(yearResults.fiscal_year) +
                  ' [' +
                  String(officeKey) +
                  ']',
                'Total Cases': yearResults.yearData.filter(
                  yearItem => yearItem.office === officeKey
                )[0].totalCases,
                Grants: Number(
                  yearResults.yearData.filter(
                    yearItem => yearItem.office === officeKey
                  )[0].totalGranted
                ),
                'Referrals / Denials': Number(
                  yearResults.yearData.filter(
                    yearItem => yearItem.office === officeKey
                  )[0].denied
                ),
                'Admin Closed / Dismissals': Number(
                  yearResults.yearData.filter(
                    yearItem => yearItem.office === officeKey
                  )[0].adminClosed
                ),
                'Granted Rate': Number(
                  yearResults.yearData.filter(
                    yearItem => yearItem.office === officeKey
                  )[0].granted
                ).toFixed(2),
              };
              rowsForTable.push(rowItem);
            }
          }
        }
        const officeHeatMapDataObject = {
          //declare helper object to construct data for heatmap plotly
          x: officeNames, //office
          y: [], //year
          z: [], //rate
        };
        for (let fiscal_year in yearByOfficeByGrant) {
          //loop through
          officeHeatMapDataObject['y'].push(fiscal_year); //include year into y axis
          let zAxisArray = []; //Array to hold each row for z axis
          for (let officeName of officeNames) {
            //loop using unique office names
            zAxisArray.push(
              yearByOfficeByGrant[fiscal_year][officeName]
                ? yearByOfficeByGrant[fiscal_year][officeName]['granted']
                : 0
            );
          }
          officeHeatMapDataObject['z'].push(zAxisArray); //push to zaxis array
        }
        return { officeHeatMapDataObject, rowsForTable };

      case 'citizenship':
        rowsForTable = [];
        for (let item of data[0].citizenshipResults) {
          rowItem = {
            Citizenship: item.citizenship,
            'Total Cases': item.totalCases,
            Grants: Number(item.totalGranted),
            'Referrals / Denials': Number(item.denied),
            'Admin Closed / Dismissals': Number(item.adminClosed),
            'Granted Rate': Number(item.granted).toFixed(2),
          };
          rowsForTable.push(rowItem);
        }
        const countryGrantRateObj = {
          countries: [],
          countriesPercentGranteds: [],
        };
        for (let country of data[0]['citizenshipResults']) {
          countryGrantRateObj['countries'].push(country['citizenship']);
          countryGrantRateObj['countriesPercentGranteds'].push(
            country['granted']
          );
        }
        return {
          rowsForTable,
          countryGrantRateObj,
        };
      default:
        return {};
    }
  } else {
    switch (view) {
      case 'time-series':
        rowsForTable = [];
        data[0].yearResults.sort((a, b) => a.fiscal_year - b.fiscal_year);
        for (let i = 0; i < data[0].yearResults.length; i++) {
          if (
            data[0].yearResults[i].yearData.filter(
              dataItem => dataItem.office === office
            )[0]
          ) {
            const officeObj = data[0].yearResults[i].yearData.filter(
              dataItem => dataItem.office === office
            )[0];
            rowItem = {
              'Fiscal Year': data[0].yearResults[i].fiscal_year,
              'Total Cases': Number(officeObj.totalCases).toLocaleString(),
              Grants: Number(officeObj.totalGranted).toLocaleString(),
              'Referrals / Denials': Number(officeObj.denied).toLocaleString(),
              'Admin Closed / Dismissal': Number(
                officeObj.adminClosed
              ).toLocaleString(),
              'Granted Rate': Number(officeObj.granted).toFixed(2),
            };
            rowsForTable.push(rowItem);
          }
        }
        const singleOfficeDataObject = officeData[office];
        return {
          rowsForTable,
          singleOfficeDataObject,
        };

      case 'citizenship':
        rowsForTable = [];
        for (let item of data[0].citizenshipResults) {
          rowItem = {
            Citizenship: item.citizenship,
            'Total Cases': item.totalCases.toLocaleString(),
            Grants: Number(item.totalGranted).toLocaleString(),
            'Referrals / Denials': Number(item.denied).toLocaleString(),
            'Admin Closed / Dismissals': Number(
              item.adminClosed
            ).toLocaleString(),
            'Granted Rate': Number(item.granted).toFixed(2),
          };
          rowsForTable.push(rowItem);
        }
        const countryGrantRateObj = {
          countries: [],
          countriesPercentGranteds: [],
        };
        for (let country of data[0]['citizenshipResults']) {
          countryGrantRateObj['countries'].push(country['citizenship']);
          countryGrantRateObj['countriesPercentGranteds'].push(
            country['granted']
          );
        }
        return {
          rowsForTable,
          countryGrantRateObj,
        };
      default:
        return {};
    }
  }
};

export { rawApiDataToPlotlyReadyInfo };
