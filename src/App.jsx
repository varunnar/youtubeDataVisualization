import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './loginPage';
import VisualizationPage from './VisualizationPage';
import './styles/button.css';
import './styles/layout.css';
import './styles/colorSchemes.css';

function App() {
  const [user, setUser] = useState(null);
  const [likedData, setLikedData] = useState([]);
  const [subData, setSubData] = useState([]);
  const allBodyColors = ["#FF0033", "#FF1493", "#FF9900", "#3366FF", "#00C853", "#212121", "#808080", "#9B51E0", "#00CC99"];
  const darkerBodyColors = ["#B2002A", "#B2106A", "#B26A00", "#2448B2", "#008F3A", "#161616", "#595959", "#6B3A9B", "#009F73"];

  const fetchSubs = async (accessToken) => {
    try {
      const url = "https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&mine=true&maxResults=50";
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        }
      });

      if (!response.ok) {
        throw new error(`Error: ${response.status}`);
      }

      const data = await response.json();
      console.log("youtube data: ", data.items);
      if (data.items) {
       await fetchChannelInfo(accessToken, data.items);
      } else {
        console.log("ERROR - Youtube subscription data missing values");
      }
    } catch(err) {
      console.log("error found, ", err);
    }
  };

  const fetchChannelInfo = async (accessToken, data) => {
    let youtube_info = [];
    for (const channel of data) {
      if (channel && channel.snippet && channel.snippet.resourceId && channel.snippet.resourceId.channelId) {
        //console.log("look for channel: " + channel.snippet.title + ". With Channel Id: " + channel.snippet.resourceId.channelId);
        //let channel_info = await fetchChannelObj(accessToken, channel.snippet.resourceId.channelId);
        let channel_tags = await fetchYoutubePlaylist(accessToken, channel.snippet.resourceId.channelId);
        let object = {
          "title": channel.snippet.title,
          "tags": channel_tags.tags,
          "branding": channel_tags.branding,
          "icon": channel.snippet.thumbnails
        }
        youtube_info.push(object);
      } else {
        console.log("channel information is unable to be found - this is an input issue");
      }
    }
    console.log("Total Sub Info JSON", JSON.stringify(youtube_info));
    setSubData(youtube_info);
  };

  const fetchYoutubePlaylist = async (accessToken, channelId) => {
    try {
      const url = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails,brandingSettings&id=${channelId}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json'
        }
      });
    
      if (!response.ok) {
        throw new error(`Error: ${response.status}`);
      } else {
        let json_version = await response.json();
        if (json_version && json_version.items && json_version.items.length > 0 && json_version.items[0].contentDetails.relatedPlaylists.uploads) {
          let tags = await fetchYoutubeTag(accessToken, json_version.items[0].contentDetails.relatedPlaylists.uploads);
          return {
            "tags": tags,
            "branding": json_version.items[0].brandingSettings.channel
          }
        } else {
          throw new error(`Error: Unable to find playlist id for ${response.status}`);
        }
      }
    } catch(err) {
      console.log("ERROR finding playlist for channelId: " + channelId + " with error " + err);
    }
  }

  const fetchYoutubeTag = async(accessToken, playlistID) => {
    try {
        const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails,status&playlistId=${playlistID}`;
      
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json'
          }
        });
      
        if (!response.ok) {
          throw new error(`Error: ${response.status}`);
        } 
        let json_version = await response.json();

        let playlist_tags = [];
        if (json_version && json_version.items && json_version.items.length > 0) {
          for (const video of json_version.items) {
            let snippet = await fetchVideoInfo(accessToken, video.contentDetails.videoId);
            if (snippet && snippet.tags) {
              let video_tags = snippet.tags;
              playlist_tags = playlist_tags.concat(video_tags);
            }
          }
        }
        return playlist_tags;
    } catch(err) {
      console.log("ERROR  - unable to find videos for playlistID: " + playlistID + " with error " + err)
    }
  }

  const fetchVideoInfo = async (accessToken, videoId) => {
    try {
      const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json'
        }
      });

      if (!response.ok) {
        throw new error(`Error - ${response.status}`);
      }

      let json_video = await response.json();
      let snippet = {};
      //console.log("json video information " + JSON.stringify(json_video.items[0].snippet.tags));
      if (json_video && json_video.items && json_video.items.length>0 && json_video.items[0].snippet) {
        return json_video.items[0].snippet;
      } else {
        throw new error(`Error - unable to find snippet objects  ${JSON.stringify(json_video)}`);
      }

    } catch(err) {
      console.log("ERROR  - unable to find video for videoId: " + videoId + " with error " + err);
      return [];
    }
  }

  const fetchLikedVideos = async (accessToken) => {
    try {
      const url = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=LL&maxResults=50";
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        }
      });

      if (!response.ok) {
        throw new error(`Error: ${response.status}`);
      }

      const data = await response.json();

      let liked_videos = [];
      if (data.items) {
        for (const video of data.items) {
          const video_info = await fetchVideoInfo(accessToken, video.contentDetails.videoId);
          if (video_info && video_info.categoryId) {
            let category = await getCategory(accessToken, video_info.categoryId);

            let liked_video_obj = {
              "title": video_info.title,
              "channel": video_info.channelTitle,
              "tags": video_info.tags,
              "category": category,
              "icon": video_info.thumbnails,
              "publishedAt": video_info.publishedAt
            }
            liked_videos.push(liked_video_obj);
          }
        }
        console.log("liked videos obj JSON - ", JSON.stringify(liked_videos));
        setLikedData(liked_videos);
      } else {
        console.log("ERROR - liked video playlist item data missing values");
      }
    } catch(err) {
      console.log("error finding liked video playlist item, ", err);
    }
  }

  const getCategory = async (accessToken, categoryId) => {
    try {
      const url = `https://www.googleapis.com/youtube/v3/videoCategories?part=snippet&id=${categoryId}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        }
      });

      if (!response.ok) {
        throw new error(`Error: ${response.status}`);
      }

      const data = await response.json();
      if (data.items && data.items.length > 0 && data.items[0].snippet && data.items[0].snippet.title) {
        return data.items[0].snippet.title;
      } else {
        console.log("ERROR - category data missing values");
      }
    } catch(err) {
      console.log("error finding category, ", err);
    }
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage setUser={setUser} fetchSubs={fetchSubs} fetchLikedVideos={fetchLikedVideos} />} />
        <Route path="/visualization" element={<VisualizationPage likedData={likedData} subData={subData} allBodyColors={allBodyColors} darkerBodyColors={darkerBodyColors} />} />
      </Routes>
    </Router>
  );
}

export default App;