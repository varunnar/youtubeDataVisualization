import React, {useState} from 'react';
import BubbleChart from './component/bubbleGraph.jsx';
import ChordGraph from './component/chordGraph.jsx';
import MapVisualization from './component/mapVisualization.jsx';
import GraphContainer from './component/graphContainer.jsx';
import LineGraph from './component/linerGraph.jsx';
import AreaGraph from './component/areaGraph.jsx';
//import HuggingFaceMistral from './ai/testMistrail.jsx';
import Gemini from './ai/gemini.jsx';
import Loading from './component/loading.jsx';

function VisualizationPage({ likedData, subData, allBodyColors, darkerBodyColors }) {

  const [chordRender, setChordRender] = useState(false);
  const [bubbleRender, SetBubbleRender] = useState(false);
  const [mapRender, setMapRender] = useState(false);
  const [areaRender, setAreaRender] = useState(false);
  const [lineRender, setLineRender] = useState(false);
  const [allowInteract, setAllowInteract] = useState(false);

  const handleGraphRender = (num) => {
    console.log("rendering graph: ", num);
    if (num == 0) {
      SetBubbleRender(true);
    } else if (num === 1) {
      setChordRender(true);
    } else if (num === 2) {
      setMapRender(true);
    } else if (num === 3) {
      setAreaRender(true);
    } else if (num === 4) {
      setLineRender(true);
    }
    if (chordRender && bubbleRender && mapRender && areaRender && lineRender) {
      console.log("All graphs have rendered");
      setAllowInteract(true);
    }
    // Perform any additional actions here
  };

  return (
    <>
    <div className={`${allowInteract ? "hide_element" : ""}`}>
      <Loading/>
    </div>
    <div className={`grid_3fr ${allowInteract ? "" : "hide_element"}`}>
      <GraphContainer title="Bubble Chart" subtitle="Top 5 Tags" description="A bubble graph detailing your most common tags used by your 50 subbed channels" isloading={!likedData || !subData}>
        <BubbleChart baseData={subData} onRender={handleGraphRender}/>
        <Gemini messaging="Analyze my top tags from this list and recommend channels who use the same" data={JSON.stringify(subData)}/>
      </GraphContainer>
      <GraphContainer title="Chord Graph" subtitle="Top 5 Tags" description="This chord details your 50 subbed channels top 5 most common tags, and where they have overlap." isloading={!likedData || !subData}>
        <ChordGraph baseData={subData} onRender={handleGraphRender}/>
        <Gemini messaging="Talk to the tags that most commonly appear between channels and mention other channels that use them" data={JSON.stringify(subData)}/>
      </GraphContainer>
      <GraphContainer title="Map Visualization" subtitle="Top 5 Tags" description="This map visualizations shows the breakdown on number of creators in different areas. Zoom in to see exactly who is from where" isloading={!likedData || !subData}>
        <MapVisualization baseData={subData} onRender={handleGraphRender}/>
        <Gemini messaging="Analyze the number of subscribers are in different locations" data={JSON.stringify(subData)}/>
      </GraphContainer>
      <GraphContainer title="Area Map of Most Liked Youtube Channels" subtitle="Top 5 Tags" description="This visualization shows how your last 50 channels broke up by channel." isloading={!likedData || !subData}>
        <AreaGraph baseData={likedData} allBodyColors={allBodyColors} onRender={handleGraphRender}/>
        <Gemini messaging="Explain how my top liked videos are split by channel and recommend channels the relate to the top ones" data={JSON.stringify(likedData)}/>
      </GraphContainer>
      <GraphContainer title="Breakdown of last 50 videos liked by category" subtitle="Top 5 Tags" description="This visualization shows the different video categories you've liked over the last 50 videos you liked." isloading={!likedData || !subData}>
        <LineGraph baseData={likedData} darkerBodyColors={darkerBodyColors} allBodyColors={allBodyColors} onRender={handleGraphRender}/>
        <Gemini messaging="Can you analyze how my liked videos have changed over time in different categories and recommend some cateogries" data={JSON.stringify(likedData)}/>
      </GraphContainer>
    </div>
    </>
  );
}

export default VisualizationPage;