import React from 'react';
import BubbleChart from './component/bubbleGraph.jsx';
import ChordGraph from './component/chordGraph.jsx';
import MapVisualization from './component/mapVisualization.jsx';
import GraphContainer from './component/graphContainer.jsx';
import LineGraph from './component/linerGraph.jsx';
import AreaGraph from './component/areaGraph.jsx';

function VisualizationPage({ likedData, subData, allBodyColors, darkerBodyColors }) {

  return (
    <div className='grid_3fr'>
      <GraphContainer title="Bubble Chart" subtitle="Top 5 Tags" description="A bubble graph detailing your most common tags used by your 50 subbed channels" isloading={!likedData || !subData}>
        <BubbleChart baseData={subData}/>
      </GraphContainer>
      <GraphContainer title="Chord Graph" subtitle="Top 5 Tags" description="This chord details your 50 subbed channels top 5 most common tags, and where they have overlap." isloading={!likedData || !subData}>
        <ChordGraph baseData={subData}/>
      </GraphContainer>
      <GraphContainer title="Map Visualization" subtitle="Top 5 Tags" description="This map visualizations shows the breakdown on number of creators in different areas. Zoom in to see exactly who is from where" isloading={!likedData || !subData}>
        <MapVisualization baseData={subData}/>
      </GraphContainer>
      <GraphContainer title="Area Map of Most Liked Youtube Channels" subtitle="Top 5 Tags" description="This visualization shows how your last 50 channels broke up by channel." isloading={!likedData || !subData}>
        <AreaGraph baseData={likedData} allBodyColors={allBodyColors}/>
      </GraphContainer>
      <GraphContainer title="Breakdown of last 50 videos liked by category" subtitle="Top 5 Tags" description="This visualization shows the different video categories you've liked over the last 50 videos you liked." isloading={!likedData || !subData}>
        <LineGraph baseData={likedData} darkerBodyColors={darkerBodyColors} allBodyColors={allBodyColors}/>
      </GraphContainer>
    </div>
  );
}

export default VisualizationPage;