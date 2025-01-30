import React, { useEffect, useState } from 'react';
import './button.css'; // Importing the CSS file
import BubbleChart from './component/visualization.jsx';
import ChordGraph from './component/chordGraph.jsx';
// import * as d3 from d3;

function App() {
  const [user, setUser] = useState(null);
  const [subData, setSubData] = useState(null);

  useEffect(() => {
    // Dynamically load the GIS library
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = () => initializeGoogleSignIn();
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initializeGoogleSignIn = () => {
    // Initialize the Google Identity Services library
    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID, // Your client ID
      callback: handleCredentialResponse, // Callback function to handle user info
    });

    // Render the "Sign in with Google" button
    window.google.accounts.id.renderButton(
      document.getElementById('signInDiv'), // The div where the button will render
      {
        theme: 'outline', // Theme of the button
        size: 'large', // Size of the button
      }
    );

    // Optionally, prompt the user to sign in
    window.google.accounts.id.prompt();
  };

  const handleCredentialResponse = (response) => {
    // Decode the JWT credential (optional, using a JWT library)
    const userObject = parseJwt(response.credential);
    setUser(userObject);
  };

  const requestAccessToken = () => {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID, // Same client ID
      scope:'https://www.googleapis.com/auth/youtube.readonly', // Scopes
      callback: (response) => {
        if (response && response.access_token) {
          console.log("access token found", response.access_token);
          fetchSubs(response.access_token);
          //fetchLikedVideos(response.access_token);
        } else {
          console.log('Failed to obtain access token.');
        }
      },
    });

    // Request the access token
    tokenClient.requestAccessToken();
  };

  // const fetchedPersonalData = async (accessToken) => {
  //   try {
  //     const url = "https://www.googleapis.com/youtube/v3/channels?part=contentDetails&mine=true";
  //     const response = await fetch(url, {
  //       method: 'GET',
  //       headers: {
  //         Authorization: `Bearer ${accessToken}`,
  //         Accept: 'application/json',
  //       }
  //     });

  //     if (!response.ok) {
  //       throw new error(`Error: ${response.status}`);
  //     }

  //     const data = await response.json();
  //     if (data.items && data.items.length > 0 && data.items[0].contentDetails.relatedPlaylists.likes) {
  //       console.log("personal data found", data.items);
  //     }

  //   } catch(err) {
  //     console.log("error finding personal data, ", err);
  //   }
  // };

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

  // const fetchChannelObj = async(accessToken, channelId) => {
  //   try {
  //     const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails&id=${channelId}`;
  //     const response = await fetch(url, {
  //       method: 'GET',
  //       headers: {
  //         Authorization: `Bearer ${accessToken}`,
  //         Accept: 'application/json',
  //       }
  //     });

  //     if (!response.ok) {
  //       throw new error(`Error: ${response.status}`);
  //     }

  //     const data = await response.json();
  //     console.log("data found", data);
  //     return data;
  //   } catch(err) {
  //     console.log("error found fetching channel additional data, ", err)
  //   }
  // }


  //SEARCH METHOD OF FINDING
  // const fetchVideoTags = async (accessToken, channelId) => {
  //   try {
  //     // First, fetch the video IDs from the channel
  //     const videoListUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=1`;
  //     const videoListResponse = await fetch(videoListUrl, {
  //       headers: {
  //         Authorization: `Bearer ${accessToken}`,
  //         Accept: 'application/json',
  //       },
  //     });

  //     const videoListData = await videoListResponse.json();
  //     // const videoIds = videoListData.items.map(item => item.id.videoId);
      
  //     // Now, use the video IDs to fetch video details
  //     if (videoListData && videoListData.items && videoListData.items.length > 0 && videoListData.items[0].id && videoListData.items[0].id.videoId) {
  //       const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoListData.items[0].id.videoId}`;
  //       const videoDetailsResponse = await fetch(videoDetailsUrl, {
  //         headers: {
  //           Authorization: `Bearer ${accessToken}`,
  //         },
  //       });
  //       const videoDetailsData = await videoDetailsResponse.json();
  //       console.log(videoDetailsData)
  //       return videoDetailsData;
  //     } else {
  //       console.log("ERROR - video list data object is missing values " + videoListData);
  //       return null;
  //     }
  
  //     // // Extract video tags
  //     // const tags = videoDetailsData.items.map(item => item.snippet.tags).flat();
  //     // console.log('Video Tags:', tags);
  //   } catch(error) {
  //     console.error('Error fetching video tags:', error);
  //   }
  // };
  

  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  return (
    <div>
      <h1>Google Identity Services Example</h1>
      <BubbleChart baseData={subData}/>
      <ChordGraph baseData={subData}/>
      <div id="signInDiv"></div>
      <div className='youtubeButton' id="requestAccess" onClick={requestAccessToken}>Collect Your Youtube Data</div>
      {user && (
        <div>
          <h2>Welcome, {user.name}</h2>
          <img src={user.picture} alt="User Profile" />
        </div>
      )}
    </div>
  );
}

export default App;


  // const initClient = () => {
  //   window.gapi.client
  //     .init({
  //       apiKey: import.meta.env.VITE_GOOGLE_PROJECT_KEY,
  //       discoveryDocs: ['https://people.googleapis.com/$discovery/rest'],
  //       clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  //       scope: 'profile',
  //     })
  //     .then(() => {
  //       return window.gapi.client.people.people.get({
  //         resourceName: 'people/me',
  //         'requestMask.includeField': 'person.names',
  //       });
  //     })
  //     .then(
  //       (response) => {
  //         console.log("RESPONSE FOUND")
  //         setData(response.result);
  //       },
  //       (error) => {
  //         console.log("ERROR FOUND", error)
  //         console.error('Error:', error.result);
  //       }
  //     );

  //     return (
  //       <>
  //        <div>Google API Example</div>;
  //        {/* <pre>{JSON.stringify(data)}</pre> */}
  //       </>
  //     )
  //}
//}

//THIS IS TEST CODE
// function App() { // Capital letter indicates component
//   const [todos, setTodos] = useState(() => {
//     const localValue = localStorage.getItem("ITEMS")
//     if (localValue == null) {
//       return [];
//     } else {
//       return JSON.parse(localValue);
//     }
//   });
//   //setNewItem("ssss") Can't do this because it causes an infinite loop cause it loops
//   //classname is for class


//   //CANNOT PUT HOOKS IN IF STATEMENTS
//   useEffect(() => {
//     localStorage.setItem("ITEMS", JSON.stringify(todos)) //saving to cache
//   }, [todos]) //array at the end shows what makes it run - so whenever todos array runs the localstorage adds
  
//   function addTodo(title) {
//     setTodos((currentTodos) => { //You need to make this function due to how state works in react.
//       // If you just use todos in setTodos without a function the state doesn't update if you use multiple operations
//       // For this reason you need to turn it into a custom function and then the return goes into the next thin
//       return [...currentTodos, 
//         {id: crypto.randomUUID(), title: title, completed: false}
//       ]
//   })
//   }

//   function toggleTodo(id, completed) {
//     setTodos(currentTodos => {
//       return currentTodos.map(todo => {
//         if (todo.id === id) {
//           return {...todo, completed}
//           // todo.completed = completed - Can't do because you are mutating the variable
//         }
//         return todo
//       })
//     })
//   }

//   function deleteTodo(id) {
//     setTodos(currentTodos => {
//       return currentTodos.filter(todo => todo.id != id);
//     })
//   }

//   return (
//   <>
//   <NewTodoForm onSubmit={addTodo}/>
//   <h1 className='header'>Todo List</h1>
//   <TodoList todos={todos} toggleTodo={toggleTodo} deleteTodo={deleteTodo}/> 
//   </>
//   )
// }

// export default App
