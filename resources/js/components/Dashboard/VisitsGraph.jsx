import { Chart } from "react-google-charts";

  
  const options = {
    chart: {
      title: "Landing Performance",
      
    },
  };
  
function App(props) {
    const data = [
      
    ];
    
    
    props.stats.forEach((s) => {
        data.push([s.date, s.count]); 
    });
    data.reverse();
    data.unshift(["Day", "Visits"])

    return (
      <Chart
        chartType="Line"
        width="100%"
        height="400px"
        data={data}
        options={options}
      />
    );
  }
  
export default App;
  