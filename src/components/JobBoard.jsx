import React, { Component, useState, useEffect } from 'react';
import JobColumn from './JobColumn';
import Modal from './Modal';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { v4 as uuidv4 } from 'uuid';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const columnsFromBackend = {
  [uuidv4()]: {
    name: 'Interested',
    dbName: 'interestedIn',
    items: [],
  },
  [uuidv4()]: {
    name: 'Applied',
    dbName: 'appliedFor',
    items: [],
  },
  [uuidv4()]: {
    name: 'Interviews',
    dbName: 'upcomingInterviews',
    items: [],
  },
  [uuidv4()]: {
    name: 'Offers',
    dbName: 'offers',
    items: [],
  },
};

// function to update columns after dragging job post
const onDragEnd = async (result, columns, setColumns) => {
  if (!result.destination) return;
  const { source, destination } = result;
  console.log('source', source);
  console.log('destination', destination);

  // post is moved to a different column/category
  if (source.droppableId !== destination.droppableId) {
    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    const sourceItems = [...sourceColumn.items];
    const destItems = [...destColumn.items];
    const [removed] = sourceItems.splice(source.index, 1);
    destItems.splice(destination.index, 0, removed);
    setColumns({
      ...columns,
      [source.droppableId]: {
        ...sourceColumn,
        items: sourceItems,
      },
      [destination.droppableId]: {
        ...destColumn,
        items: destItems,
      },
    });

    // console.log('HEY removed: ', removed)
    // console.log('HEY sourceColumn', sourceColumn);
    // console.log('source.droppableId', source.droppableId);
    // console.log('destination col', destColumn);
    // console.log('destination...', destination.droppableId);

    // console.log('indices', destination.index, source.index)

    // beginning skeleton for posting changes to server after drag event. NEEDS WORK
    async function fetchData() {
      const moved = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: '5f75e7b2d3a398548e7addf1',
          jobId: removed._id,
          prevCol: sourceColumn.dbName,
          prevIndex: source.index,
          newCol: destColumn.dbName,
          newIndex: destination.index,
          boardIndex: 0,
        }),
      };
      const res = await fetch('http://localhost:8080/api/moveJob', moved);
      res
        .json()
        .then((res) => console.log('front end response line 87', res))
        .catch((err) => console.log(err));
    }
    await fetchData();
  } else {
    const column = columns[source.droppableId];
    const copiedItems = [...column.items];
    const [removed] = copiedItems.splice(source.index, 1);
    copiedItems.splice(destination.index, 0, removed);
    setColumns({
      ...columns,
      [source.droppableId]: {
        ...column,
        items: copiedItems,
      },
    });
    async function moveIndex() {
      const moved = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: '5f75e7b2d3a398548e7addf1',
          jobId: removed._id,
          prevCol: column.dbName,
          prevIndex: source.index,
          newCol: column.dbName,
          newIndex: destination.index,
          boardIndex: 0,
        }),
      };
      const res = await fetch('http://localhost:8080/api/moveJob', moved);
      res
        .json()
        .then((res) => console.log('front end response line 87', res))
        .catch((err) => console.log(err));
    }
    await moveIndex();
  }
};

const handleDelete = (e, job, idx, column) => {
  const jobId = job._id;
  // console.log('column db', column)
  // console.log('jobId', jobId);
  // console.log('e parent', e.target.parentNode);
  // console.log('index', idx)
  fetch(`/api/${jobId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: '5f75e7b2d3a398548e7addf1',
      column: column,
      index: idx
    }),
  })
    .then((res) => res.json())
    .then((response) => {
      if (response.status === 200) {
        let post = document.getElementById(`${jobId}`);
        post.remove();
        // setColumns()
      }
    })
    .catch((err) => console.log(err));
  window.location.reload();
};

function JobBoard(props) {
  const { userId, setChanger, changer } = props;
  const [columns, setColumns] = useState(columnsFromBackend);
  console.log('columns in jobBoard', columns);
  const [jobs, setJobs] = useState({});
  const [open, setOpen] = useState(false);
  const [display, setDisplay] = useState('none');
  const [modalJob, setModalJob] = useState({});

  // fetch request to get all board info and jobs for logged in user - NEED TO REDO with new schema
  async function fetchData() {

    console.log('userId in fetch data ', userId)
    try{
    const userRequest = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: '5f75e7b2d3a398548e7addf1' }),
    };
    const res = await fetch('/api/getJobs', userRequest);
    const parsed = await res.json();

    await setJobs(parsed);
    console.log('setJobs with new userid', parsed, userId)
    renderJobs(parsed)
    const makingIt = changer;
    setChanger(2);
  } catch (err) {
    console.log('job board post fetch problem ', err)
  }
  }

  async function renderJobs(parsed) {
    setColumns({
      'f0ae9269-d425-43e8-91e5-177e6033c1f4': {
        ...columns['f0ae9269-d425-43e8-91e5-177e6033c1f4'],
        name: 'Interested',
        dbName: 'interestedIn',
        items: parsed.interestedIn,
      },
      'be643203-6f1b-40ca-92ab-ce6f867e6755': {
        ...columns['be643203-6f1b-40ca-92ab-ce6f867e6755'],
        name: 'Applied',
        dbName: 'appliedFor',
        items: parsed.appliedFor,
      },
      'ec38e4c5-dcf2-4cb7-b648-7f52d2f77966': {
        ...columns['ec38e4c5-dcf2-4cb7-b648-7f52d2f77966'],
        name: 'Interviews',
        dbName: 'upcomingInterviews',
        items: parsed.upcomingInterviews,
      },
      '3da033ba-7d52-46bf-9225-f702731d5939': {
        ...columns['3da033ba-7d52-46bf-9225-f702731d5939'],
        name: 'Offers',
        dbName: 'offers',
        items: parsed.offers,
      },
    });
  }

  useEffect(async () => {
    console.log('we need USSER ID', userId)
    await fetchData();
    console.log('jobs', jobs);
  }, []);

  return (
    <div className="jobBoard">
      <h2>Your Job Board</h2>
      <div className="board">
        <DragDropContext
          onDragEnd={(result) => onDragEnd(result, columns, setColumns)}
        >
          {Object.entries(columns).map(([columnId, column], index) => {
            return (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
                key={columnId}
              >
                <h2>{column.name}</h2>
                <div style={{ margin: 8 }}>
                  <Droppable droppableId={columnId} key={columnId}>
                    {(provided, snapshot) => {
                      return (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          style={{
                            background: snapshot.isDraggingOver
                              ? '#kkkkkk'
                              : 'white',
                            padding: 4,
                            width: 250,
                            minHeight: 500,
                            borderRadius: '12px',
                          }}
                        >
                          {column.items.map((item, index) => {
                            return (
                              <Draggable
                                id={`job-${index}`}
                                key={item._id}
                                draggableId={item._id}
                                index={index}
                              >
                                {(provided, snapshot) => {
                                  return (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      style={{
                                        userSelect: "none",
                                        padding: 4,
                                        margin: "7px",
                                        minHeight: "50px",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        backgroundColor: snapshot.isDragging
                                          ? "#888888"
                                          : "#3367F9",
                                        color: "white",
                                        ...provided.draggableProps.style,
                                        borderRadius: "8px",
                                      }}
                                    >
                                      <div class="jobContainer">
                                        <div className="jobInfoDisplay">
                                          <p className="jobTitle">
                                            {item.title}
                                          </p>
                                          <p className="jobCompany">
                                            {item.company}
                                          </p>
                                        </div>
                                        <div className="buttonContainer">
                                          <span>
                                            <button
                                              id="clickable"
                                              style={{
                                                backgroundColor: "transparent",
                                                width: "50px",
                                                height: "50px",
                                                borderRadius: "10px",
                                                marginLeft: "1%",
                                              }}
                                              onClick={(e) => {
                                                setModalJob(item);
                                                setOpen(true);
                                              }}
                                            >
                                              <svg
                                                width="1.5em"
                                                height="1.5em"
                                                viewBox="0 0 16 16"
                                                class="bi bi-list-ul"
                                                fill="currentColor"
                                                xmlns="http://www.w3.org/2000/svg"
                                              >
                                                <path
                                                  fill-rule="evenodd"
                                                  d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm-3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
                                                />
                                              </svg>
                                            </button>
                                          </span>
                                          <button
                                            id="jobDelete"
                                            onClick={(e) =>
                                              handleDelete(
                                                e,
                                                item,
                                                index,
                                                column.dbName
                                              )
                                            }
                                          >
                                            <svg
                                              width="1.5em"
                                              height="1.5em"
                                              viewBox="0 0 16 16"
                                              class="bi bi-trash"
                                              fill="currentColor"
                                              xmlns="http://www.w3.org/2000/svg"
                                            >
                                              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                                              <path
                                                fill-rule="evenodd"
                                                d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
                                              />
                                            </svg>
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }}
                              </Draggable>
                            );
                          })}
                          {open ? (
                            <Modal open={open} setOpen={setOpen} job={modalJob} fetchData={fetchData}></Modal>
                          ) : null}
                          {provided.placeholder}
                        </div>
                      );
                    }}
                  </Droppable>
                </div>
              </div>
            );
          })}
        </DragDropContext>
      </div>
    </div>
  );
}

export default JobBoard;
