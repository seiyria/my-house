
const FirebaseRef = new Firebase('https://seiyria-myhouse.firebaseio.com/datapoints');
var data = null;

const transformData = (data) => {
  return _.sortBy(_.values(data), 'timestamp');
};

var climateChart = null;
var soundChart = null;

Highcharts.setOptions({
  global: {
    useUTC: false
  }
});

const TIME_COEFFICIENT = 1000 * 60 * 5;

const formatClimateData = (data) => {
  const reporters = _(data).map('reporter').uniq().value();
  const orgKeys = ['temperature', 'humidity'];

  const retVal = [];
  _.each(reporters, reporter => {

    const reporterData = _.filter(data, obj => obj.reporter === reporter);

    _.each(orgKeys, (key, idx) => {
      const filtered = _.zip(
          _.map(reporterData, obj => Math.round(obj.timestamp / TIME_COEFFICIENT) * TIME_COEFFICIENT),
          _.map(reporterData, obj => Math.round(obj[key]))
      );

      retVal.push({
        name: `${_.capitalize(key)} (${reporter})`,
        yAxis: idx,
        tooltip: {
          valueSuffix: idx === 0 ? '°F' : '%'
        },
        type: idx === 0 ? 'line' : 'column',
        data: filtered
      });
    });
  });

  return retVal;
};

const climateChartData = (data) => {
  if(!climateChart) {
    climateChart = new Highcharts.Chart({
      chart: {
        renderTo: 'climate',
        zoomType: 'x'
      },
      title: {
        text: 'Temperature & Humidity'
      },
      tooltip: {
        shared: true
      },
      xAxis: {
        type: 'datetime'
      },
      yAxis: [
        {
          title: { text: 'Temperature' },
          labels: { format: '{value}°F' },
          min: 0,
          max: 100
        },
        {
          title: { text: 'Humidity' },
          labels: { format: '{value}%' },
          opposite: true,
          min: 0,
          max: 100
        }
      ],
      series: data,
      credits: false
    });
    return;
  }

  for(var i = 0; i < data.length; i++) {
    climateChart.series[i].setData(data[i].data);
  }
};

const formatSoundData = (data) => {
  const reporters = _(data).map('reporter').uniq().value();
  const orgKeys = ['sound', 'light'];

  const retVal = [];
  _.each(reporters, reporter => {

    const reporterData = _.filter(data, obj => obj.reporter === reporter);

    _.each(orgKeys, (key, idx) => {
      const filtered = _.zip(
          _.map(reporterData, obj => Math.round(obj.timestamp / TIME_COEFFICIENT) * TIME_COEFFICIENT),
          _.map(reporterData, obj => Math.round(obj[key] * 1000))
      );

      retVal.push({
        name: `${_.capitalize(key)} (${reporter})`,
        yAxis: idx,
        tooltip: {
          valueSuffix: '%'
        },
        type: 'line',
        data: filtered
      });
    });
  });

  return retVal;
};

const soundChartData = (data) => {
  if(!soundChart) {
    soundChart = new Highcharts.Chart({
      chart: {
        renderTo: 'sound',
        zoomType: 'x'
      },
      title: {
        text: 'Sound Level'
      },
      tooltip: {
        shared: true
      },
      xAxis: {
        type: 'datetime'
      },
      yAxis: [
        {
          title: { text: 'Sound Level' },
          labels: { format: '{value}%' },
          min: 0,
          max: 100
        },
        {
          title: { text: 'Light Level' },
          labels: { format: '{value}%' },
          opposite: true,
          min: 0,
          max: 100
        }
      ],
      series: data,
      credits: false
    });
    return;
  }

  for(var i = 0; i < data.length; i++) {
    soundChart.series[i].setData(data[i].data);
  }
};

const setData = (newData) => {
  data = transformData(newData);
  climateChartData(formatClimateData(data));
  soundChartData(formatSoundData(data));
};

FirebaseRef.on('value', (snapshot) => {
  setData(snapshot.val());
});
