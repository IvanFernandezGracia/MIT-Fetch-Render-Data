const Pagination = ({ items, pageSize, onPageChange }) => {
  const { Button } = ReactBootstrap;
  if (items.length <= 1) return null;
  let num = Math.ceil(items.length / pageSize);
  let pages = range(1, num + 1);
  const list = pages.map((page) => {
    return (
      <Button key={page} onClick={onPageChange} className="page-item">
        {page}
      </Button>
    );
  });
  return (
    <nav>
      <ul className="pagination">{list}</ul>
    </nav>
  );
};

const range = (start, end) => {
  return Array(end - start + 1)
    .fill(0)
    .map((item, i) => start + i);
};

function paginate(items, pageNumber, pageSize) {
  const start = (pageNumber - 1) * pageSize;
  let page = items.slice(start, start + pageSize);
  return page;
}

const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });

  useEffect(() => {
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      let responses = [];
      try {
        for (let i = 1; i < 21; i++) {
          responses[i - 1] = await axios(url + `/${i}`);
        }
        if (!didCancel) {
          let data = {
            result: responses.map((res) => {
              return res.data;
            }),
          };
          dispatch({ type: "FETCH_SUCCESS", payload: { results: data } });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};

const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

// App that gets data from Hacker News url
function App() {
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState("MIT");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 3;
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "https://pokeapi.co/api/v2/pokemon",
    {
      results: { result: [] },
    }
  );
  const handlePageChange = (e) => {
    setCurrentPage(Number(e.target.textContent));
  };
  let page = data.results.result;
  if (page.length >= 1) {
    page = paginate(page, currentPage, pageSize);
    console.log(`currentPage: ${currentPage}`);
  }

  const { Card } = ReactBootstrap;

  return (
    <Fragment>
      {isLoading ? (
        <div>Loading ...</div>
      ) : (
        <div>
          {page.map((item) => (
            <div key={item.name} style={{display:"inline-block"}}>
              <Card style={{ width: "15vw" }}>
                <Card.Img
                  variant="top"
                  src={item.sprites.back_default}
                />
                <Card.Body>
                  <Card.Title>{item.name}</Card.Title>
                  <Card.Text style={{fontSize:"0.5em"}}>
                  Has the ability to    {item.abilities[0].ability.name} 
                  </Card.Text>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      )}
      <Pagination
        items={data.results.result}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      ></Pagination>
    </Fragment>
  );
}

// ========================================
ReactDOM.render(<App />, document.getElementById("root"));
