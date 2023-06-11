import React, { useState, useEffect } from 'react';

function App() {
  const [isLoading,setIsLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('')
  /*
  Currently loaded vehicles
  */
  const [vehicles, setVehicles] = useState([])
  /*
  Next URL to fetch the next paginated data
   */
  const [nextURL, setNextURL] = useState([])
  /*
  Previous URL to fetch the previous paginated data
  */
  const [previousURL, setPreviousURL] = useState([])
  /*
  Total expected vehicles for the current search criteria
   */
  const [totalCount, setTotalCount] = useState(0)
  /*
  Min starting index of the current page
  */
  const [minIndexPage, setMinIndexPage] = useState(0)
  /*
    Max starting index of the current page
  */
  const [maxIndexPage, setMaxIndexPage] = useState(0)
  /*
  Manage state of the left/previous button
   */
  const [isLeftButtonDisabled, setIsLeftButtonDisabled] = useState(true);
  /*
  Manage state of the right/next button
  */
  const [isRightButtonDisabled, setIsRightButtonDisabled] = useState(true);

  let defaultURL =   "https://swapi.dev/api/starships/?search="

    /**
     * method is for loading content at start up and for any actions
     * @param currentURL - URL to load contents from
     * @param searchValue - apply search criteria for the loading
     * @param leftOrRight - o if its a new search, 1 if its a right pagination action and 2 if its a left pagination action
     * @returns {Promise<void>}
     */
    const fetchOrchestration = async (currentURL, searchTempValue, leftOrRight) => {
       try {
           setIsLoading(true);
           console.log('URL to fetch', currentURL)
           console.log('search value', searchTempValue);
           var nextURL = currentURL
           if (nextURL === defaultURL) {
               console.log('search default', searchTempValue);
               nextURL = nextURL.replace("search=", "search=".concat(searchTempValue))

           }
           console.log('fetch url', nextURL);
           const response = await fetch(nextURL);
           const data = await response.json();
           setVehicles([]);
           data.results.map(result => {
                   setVehicles((previousData) => [...previousData, result]);
           });
           console.log('setting next url', data.next)
           setNextURL(data.next);
           console.log('setting previous url', data.previous);
           setPreviousURL(data.previous);
           console.log('setting count', data.count);
           setTotalCount(data.count);

           if(data.next != null) {
            //  console.log('next button is enable');
               setIsRightButtonDisabled(false);
           }
           else {
           //    console.log('next button is disabled');
               setIsRightButtonDisabled(true);
           }

           if(data.previous != null) {
           //    console.log('previous button is enable');
               setIsLeftButtonDisabled(false);
           }
           else {
           //   console.log('previous button is disabled');
               setIsLeftButtonDisabled(true);
           }
           // left next, previous url drive state transition for page min and max state transition.
           var currentMinIndex = Number(minIndexPage);
           let total = data.count;
       //    console.log('Handle min before', total, currentMinIndex, minIndexPage);
           if (leftOrRight === 0) {
               // we are loading page because we are loading a new search or starting app
           //    console.log('Handle min to 1');
               currentMinIndex = 1;
           } else {
               // we should have current state
               if (leftOrRight === 1) { // means we have clicked right
               //    console.log('Handle min to go right');
                   currentMinIndex = currentMinIndex + 10;
               } else { // means we have clicked left
                //   console.log('Handle min to go left');
                   currentMinIndex = currentMinIndex - 10;
               }
           }
           setMinIndexPage(currentMinIndex);
        //   console.log('Handle min after', total, currentMinIndex, minIndexPage);

           let currentMaxIndex = Number(maxIndexPage);
           let numberOfElement = data.results.length;
        //   console.log('Handle max before', total, currentMaxIndex, numberOfElement);
           if (leftOrRight === 0) {
               // we are loading page because we are loading a new search or starting app
               currentMaxIndex = Math.min(10, Number(numberOfElement));
            //   console.log('Handle max for new search', currentMaxIndex);
           }
           else {
               console.log('Handle max for left or right', currentMaxIndex);
             currentMaxIndex = Math.min((currentMinIndex + numberOfElement -1), total);
           }
           setMaxIndexPage(currentMaxIndex);
           setIsLoading(false);
           // console.log('Handle max after', total, currentMaxIndex, maxIndexPage);
       } catch (error) {
            console.error('Error fetching data', error)
       }
    };

    const handleRight = () => {
       console.log('clicked next button');
       fetchOrchestration(nextURL, "", 1);
    }

    const handleLeft = () => {
        console.log('clicked previous button');
        fetchOrchestration(previousURL, "", 2);
    }

    const handleSearch = (changeValue) => {
        console.log('search initiated', changeValue);
        fetchOrchestration(defaultURL, changeValue, 0);
        setSearchValue(changeValue);
    }

  useEffect(() => {
      fetchOrchestration(defaultURL, "", 0);
  }, []);



  return (
      <div>
          {isLoading ? (
              <div className="spinner-container">
                 <div className="spinner"></div>
              </div>
              ) : (
                <>
                <div className="input-container">
                    <h2>Vehicles</h2>
                </div>
                <div className="input-container">
                      <input
                          className="centered-input"
                          title= "Search vehicles"
                          placeholder=""
                          value = {searchValue}
                          onChange={e => {
                              let changeValue = e.target.value;
                              console.log('search value on change', changeValue)
                              handleSearch(changeValue);
                            }
                          }
                      />
                </div>
                <table className="centered-table">
                        <thead>
                        <tr>
                            <th>Name</th>
                            <th>Cost in Credits</th>
                            <th>Length</th>
                        </tr>
                        </thead>
                        <tbody>
                            {vehicles.map(vehicle => (
                                <tr key={vehicle.name}>
                                    <td lassName="label-cell">{vehicle.name}</td>
                                    <td lassName="label-cell">{vehicle.cost_in_credits}</td>
                                    <td lassName="label-cell">{vehicle.length}</td>
                                </tr>
                            ))}
                          <tr>
                              <td></td>
                              <td></td>
                              <td>
                              <div className="controls-div">
                                  <label>{Number(minIndexPage)} - {Number(maxIndexPage)} of {Number(totalCount)}</label>
                                  <button disabled={isLeftButtonDisabled} onClick={handleLeft}>pre</button>
                                  <button disabled={isRightButtonDisabled} onClick={handleRight}>next</button>
                              </div>
                              </td>
                          </tr>
                        </tbody>
                    </table>
                </>)
      }
      </div>
  );
};

export default App;
