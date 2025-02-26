import React, { useEffect, useState } from "react";
import "./Jobs.scss";

// Images
import { Backdrop, CircularProgress, Grid } from "@mui/material";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import axios from "axios";
import { useNavigate, useRouteLoaderData } from "react-router-dom";
import SaveButton from "../../Assets/Images/jobs-posts_save.svg";
import Layer from "../../Assets/Images/layer.png";
import Cancel from "../../Assets/Images/X-icon.svg";
import { Footer } from "../../Widgets";
import Header from "../../Widgets/Header/Header";

export const Jobs = () => {
  const [openLoader, setOpenLoader] = useState(false);
  const [showBtnLoadMore, setShowBtnLoadMore] = useState(true);
  const [jobs, setJobs] = useState(null);
  const [jobCard, setJobCard] = useState(null);
  const [jobCardOpen, setJobCardOpen] = useState(false);
  const [locations, setLocations] = useState(null);
  const [modal, setModal] = useState(false);
  const [jobsSearch, setJobsSearch] = useState("");
  const [locationOption, setLocationOption] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [placeholder, setPlaceholder] = useState(false);
  const [placeholderSelect, setPlaceholderSelect] = useState(false);

  const url = "https://jobas.onrender.com/api";
  const navigate = useNavigate();

  // Pagination start
  const [state, setState] = useState({
    todos: [],
    currentPage: 1, // Current page number
    todosPerPage: 5, // Number of items to display per page
  });

  const { todos, currentPage, todosPerPage } = state;

  const indexOfLastTodo = currentPage * todosPerPage;
  const indexOfFirstTodo = indexOfLastTodo - todosPerPage;
  let currentTodos = todos.slice(indexOfFirstTodo, indexOfLastTodo);

  //User data

  const userData = JSON.parse(localStorage?.getItem("userData"))




  // Refreshes the current jobs
  // const search = () => {
  //   currentTodos = todos.slice(indexOfFirstTodo, indexOfLastTodo);
  //   return;
  // };
  function handleLoadMore() {
    setState((prevState) => ({
      ...prevState,
      todosPerPage: todosPerPage + 3,
    }));
    if (todosPerPage + 3 >= todos.length) {
      return setShowBtnLoadMore(false);
    }
  }
  // Pagination end
  // Get Jobs
  useEffect(() => {
    setOpenLoader(true);
    axios
      .get(`${url}/job`)
      .then((data) => {
        setJobs(data.data);
        setState((prevState) => ({
          ...prevState,
          todos: data.data,
        }));
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setOpenLoader(false);
        // setLoading(false)
      });
  }, []);

  // Get Jobs Location
  useEffect(() => {
    axios
      .get(`${url}/job/location`)
      .then((data) => {
        setLocations(data.data);
        setState((prevState) => ({
          ...prevState,
          todos: data.data,
        }));
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        // setLoading(false)
      });
  }, []);

  //Using this var on modal apply as well. So made it global

  let jobId = "";

  // Get Job Info
  const handleCardClick = (evt) => {
    evt.preventDefault();
    setLoading(true);
    setJobCardOpen(true);
    jobId = evt?.target?.dataset?.id;

    if (!jobId) {
      // If jobId2 is not available, try getting the parent element's id
      jobId = evt?.target?.parentElement?.id;

      // If still not found, try recursively checking the parent elements until a valid jobId2 is found
      let parentElement = evt?.target?.parentElement?.parentElement;
      while (!jobId && parentElement) {
        jobId = parentElement.id;
        parentElement = parentElement.parentElement;
      }
    }
    setOpenLoader(true);
    axios
      .get(`${url}/job/${jobId}`)
      .then((data) => {
        setJobCard(data.data);
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setOpenLoader(false);
        setLoading(false);
      });
  };

  const handleSearchInput = (evt) => {
    if (evt.target.value !== "") {
      setPlaceholder(true);
    } else {
      setPlaceholder(false);
    }

    setJobsSearch(evt.target.value);
  };

  const handleSelectInput = (evt) => {
    console.log(evt.target.value);
    if (evt.target.value !== "") {
      setPlaceholderSelect(true);
    } else {
      setPlaceholderSelect(false);
    }

    setLocationOption(evt.target.value);
  };

  const handleSearchSubmit = (evt) => {
    evt.preventDefault();
    setJobCardOpen(false);
    setOpenLoader(true);
    axios
      .get(`${url}/job/search`, {
        params: { comLocation: locationOption, jobTitle: jobsSearch },
      })
      .then((data) => {
        // if(jobsSearch===''){
        //   console.log('NO')
        //   setShowBtnLoadMore()
        // }
        setJobs(data.data);
        setState((prevState) => ({
          ...prevState,
          todos: data.data,
        }));
        setShowBtnLoadMore(false);
        // currentTodos = todos.slice(indexOfFirstTodo, indexOfLastTodo);
        // currentTodos = todos.slice(indexOfFirstTodo, indexOfLastTodo);
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setLoading(false);
        setOpenLoader(false);
      });
  };

  const handleApply = () => {
    const verified = localStorage.getItem("verify");
    if (verified) {
      if (JSON.parse(verified) === true) return setModal(true);
    } else navigate("/user/login");
  };

  const [applyFile, setApplyFile] = useState(null);

  const handleFileUpload = async (evt) => {
    if (evt.target.files) {
      setApplyFile(evt.target.files[0]);
    }
  };

  const handleApplySubmit = async (evt) => {
    evt.preventDefault();
    setLoading(true);

    let formData = new FormData();

    formData.append("resume", applyFile);
    formData.append("userEmail", evt.target.inputEmail.value);
    formData.append("userFullName", evt.target.inputName.value);
    formData.append("jobId", jobId);

    await axios
      .post(`${url}/employees`, {
        formData,
        headers: {
          token: localStorage.getItem("token"),
        },
      })
      .then((res) => {
        console.log(res.status);
      })
      .catch((err) => {
        console.log(err);
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  //* Handles more button event
  // const handleLoadMore = () => {
  //   setVisibleCards((prevVisibleCards) => prevVisibleCards + 5);
  // };

  if (error) return <p className="error">Something went wrong. Try again...</p>;

  if (loading)
    return (
      <Backdrop
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          width: "100%",
        }}
        open={openLoader}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    );

  return (
    <>
      {/* Backdrop Loader */}

      <Backdrop
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          width: "100%",
        }}
        open={openLoader}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      {/* JOBS */}
      {modal ? (
//         <div className="modal-wrapper">
//  <div className="container max-w-[1728px]  mx-auto position-relative">
//           <main className=" w-full ">
//             <div className="flex absolute top-[106px] rounded-md right-[276px] flex-col z-40 space-y-[40px] items-center px-[40px] w-[612px] min-h-[637px]  bg-white modal-content">
//               <CssBaseline />
//               <Box
//                 sx={{
//                   marginTop: 8,
//                   display: "flex",
//                   flexDirection: "column",
//                   alignItems: "start",
//                   pb: "104px",
//                 }}
//               >
//                 <div className="modal-wrap">
//                   <img width={48} height={48} src={jobCard?.comImg} alt={"Company image"} />
//                   <div>
//                     <Typography
//                       component="h5"
//                       variant="h5"
//                       className="font-semibold text-black text-[10px]"
//                     >
//                       <span className="modal__com-name">
//                       {jobCard?.comName}
//                       </span>
//                     </Typography>
//                     <Typography
//                       component="h6"
//                       variant="h6"
//                       className="text-[#999] text-[16px] font-normal"
//                     ><span className="modal__job-title">
//                       Apply as a {jobCard?.jobTitle}
//                     </span>
//                     </Typography>
//                   </div>
//                   <span className="xIcon" onClick={() => setModal(false)}>
//                     X
//                   </span>
//                 </div>
//                 <Box component="form" noValidate sx={{ mt: 3 }}>
//                   <Grid container spacing={2}>
//                     <Grid item xs={12}>
//                        <TextField
//                         autoComplete="given-name"
//                         name="email"
//                         required
//                         fullWidth
//                         id="email"
//                         label="Email address"
//                         autoFocus
//                       />
//                     </Grid>
//                     <Grid item xs={12}>
//                       <TextField
//                         required
//                         fullWidth
//                         id="full_name"
//                         label="Full names"
//                         name="full_name"
//                         autoComplete="full_name"
//                       />
//                     </Grid>
//                     <Grid item xs={12}>
//                            <TextField
//                         required
//                         fullWidth
//                         id="resume"
//                         label="Resume"
//                         name="resume"
//                         // type="file"
//                       > </TextField>
//                     </Grid>
//                   </Grid>
//                   <div className="flex flex-col pt-[30px] items-center justify-between w-full space-y-4">
//                     <button
//                       type="submit"
//                       className=" w-full py-[23px] transition-all bg-[#0050C8] font-normal active:bg-blue-800 hover:bg-blue-600 text-[16px] text-white rounded-md "
//                     >
//                       Apply
//                     </button>
//                   </div>
//                 </Box>
//               </Box>
//             </div>
//           </main>
//         </div>
//         </div>
<div className="jobs__modal">
  <div className="jobs__modal-content">
  <span className="xIcon" onClick={() => setModal(false)}>
X</span>
<div className="jobs__modal-info-wrapper">
<img width={48} height={48} src={jobCard?.comImg} alt={"Company image"} />
<div className="jobs__modal-texts-wrapper">
<span className="jobs__modal-com-name">
{jobCard?.comName}</span>
<span className="jobs__modal-job-title">
Apply as a {jobCard?.jobTitle}</span>
</div>
</div>
<form onSubmit={handleApplySubmit} className="jobs__modal-form">
  <label className="jobs__label" htmlFor="inputEmail">Email address <span style={{color: "red"}}>*</span>
  </label>
<input defaultValue={userData?.email}
placeholder="alex@gmail.com" id="inputEmail" type="email" className="jobs__input" />
<label className="jobs__label" htmlFor="inputName">Full names<span style={{color: "red"}}>*</span>
  </label>
<input defaultValue={userData?.fullName}  style={{marginBottom: 26}} placeholder="Alex Johnson" id="inputName" type="text" className="jobs__input" />
<label className="jobs__label" htmlFor="inputFile">Resume<span style={{color: "red"}}>*</span>
  </label>
<input onChange={handleFileUpload} style={{marginBottom: 26}} placeholder="" id="inputFile" type="file" className="jobs__input jobs__file-input"  />
<button
                      type="submit"
                      className="jobs__form-button"
                    >
                      Apply
                    </button>
</form>
  </div>
</div>
      ) : (
        ""
      )}
      <Header />
      <div className="jobs">
        <div className="container">
          <div className="jobs-inner">
            <div className="jobs-inner__hero">
              <h2 className="jobs-title">Jobs</h2>
              <p className="jobs-text">Find your dream job</p>
            </div>
            <form
              onSubmit={handleSearchSubmit}
              className="jobs-inner__hero jobs-inputs"
            >
              <div className="placeholder-wrap input-wrap">
                <input
                  onChange={handleSearchInput}
                  className="jobs-inner__input"
                  type="text"
                  name="job"
                />
                <span
                  style={placeholder ? { display: "none" } : {}}
                  class="placeholder"
                >
                  <b class="placeholder-important">What </b> The kind of job you
                  want
                </span>
              </div>
              <div className="placeholder-wrap">
                <select
                  onChange={handleSelectInput}
                  // onChange={(e) => setLocationOption(e.target.value)}
                  className="jobs-inner__select"
                  name="location-job"
                >
                  {/* <option value="" disabled selected hidden>
                  <b className="placeholder-important">Where </b> Choose job location
                </option> */}
                  <option hidden selected disabled value=""></option>
                  <option value="All">All locations</option>
                  {locations?.map((loc) => (
                    <option key={loc.id} value={loc.location}>
                      {loc.location}{" "}
                    </option>
                  ))}
                </select>
                <span
                  style={placeholderSelect ? { display: "none" } : {}}
                  class="placeholder"
                >
                  <b class="placeholder-important">Where </b> Choose your
                  location
                </span>
              </div>

              <button type="submit" className="jobs-inner__button">
                Search
              </button>
            </form>
          </div>
        </div>
      </div>
      {/* JOBS POSTS */}
      <div className="job-posts">
        <div className="container jobs-container">
          <h3 className="job-posts__title">Latest added</h3>
          {currentTodos.length > 0 ? (
            <div className="job-posts__inner-wrapper">
              {/* Pagination */}
              {/* <div className="flex  items-center flex-col justify-between w-full"> */}
              <div className="job-post__left">
                <ul
                  style={
                    jobCardOpen
                      ? {
                          flexDirection: "column",
                          alignItems: "flex-start",
                        }
                      : {}
                  }
                  className="job-posts__inner"
                >
                  {currentTodos?.length &&
                    currentTodos?.map((job) => (
                      <li key={job?._id}>
                        <div
                          data-id={job?._id}
                          id={job?._id}
                          onClick={handleCardClick}
                          className="job-posts__static"
                        >
                          <div className="job-posts__card">
                            <div className="inner-wrapper">
                              <img
                                width={46}
                                height={48}
                                src={job?.comImg}
                                alt="flag country"
                              />
                              <div className="job-posts__items">
                                <h3 className="job-posts__company">
                                  {job?.comName}
                                </h3>
                                <p className="job-posts__location">
                                  {job?.comLocation}
                                </p>
                              </div>
                              <div className="save-button">
                                <button className="save-button__btn">
                                  <img
                                    className="save-button__img"
                                    src={SaveButton}
                                    alt="save button"
                                    width={14}
                                    height={14}
                                  />
                                  <span className="save-button__text">
                                    save
                                  </span>
                                </button>
                              </div>
                            </div>
                            <h4 className="job-posts__profession">
                              {job?.jobTitle}
                            </h4>
                            <div className="job-post__wrapper">
                              <p className="job-posts__text">{job?.jobInfo}</p>
                            </div>
                            <span className="job-posts__skills">Skills:</span>
                            <ul className="job-posts__list">
                              {job?.jobSkills?.map((skill) => (
                                <li className="job-posts__item" key={skill._id}>
                                  {skill.skillName}
                                </li>
                              ))}
                            </ul>
                          </div>
                          {/* Info block */}
                          <div className="info-block">
                            <ul className="info-list">
                              <li className="info-item">{job?.jobType}</li>
                              <li className="info-item">
                                {job?.jobCooperate ? "Contract" : "Intern"}
                              </li>

                              <li className="info-item">
                                {job?.jobPrice}&nbsp;
                                {job?.moneyTypeId?.moneyType}
                              </li>
                            </ul>
                          </div>
                        </div>
                      </li>
                    ))}
                </ul>
                {showBtnLoadMore ? (
                  <button
                    onClick={() => handleLoadMore()}
                    className="job__load-more-button"
                  >
                    Load More
                  </button>
                ) : (
                  ""
                )}
              </div>
              {/* Card more info */}
              <div className="job-post__right">
                {jobCardOpen ? (
                  <div className="job-more-wrapper">
                    <div className="more-upper">
                      <div className="more-inner">
                        <h3 className="more-title">Job Details</h3>
                        <div className="more-wrapper__img">
                          <img
                            onClick={() => setJobCardOpen(false)}
                            className="more-img"
                            src={Cancel}
                            alt="cancel button"
                          />
                        </div>
                        {/* Career */}
                      </div>
                      <div className="more-down">
                        <div className="more-down__inner">
                          {loading ? (
                            ""
                          ) : (
                            <img
                              width={48}
                              height={48}
                              className="more-adjust__img"
                              src={jobCard?.comImg}
                              alt="flag more"
                            />
                          )}
                          <div className="more-info">
                            <h4 className="more-info__company">
                              {jobCard?.comName}
                            </h4>
                            <span className="more-info__location">
                              {jobCard?.comLocation}
                            </span>
                          </div>
                          <div className="more-save__button">
                            <button className="save-button__btn">
                              <img
                                className="save-button__img"
                                src={SaveButton}
                                alt="save button"
                              />
                              <span className="save-button__text">save</span>
                            </button>
                          </div>
                        </div>
                        <h3 className="more-down__title">
                          {jobCard?.jobTitle}
                        </h3>
                        <div className="more-down__text">
                          <p className="more-down__desc">{jobCard?.jobInfo}</p>
                          <div className="more-down__outer">
                            <p className="more-down__skills">Skills:</p>
                            <ul className="more-down__list">
                              {jobCard?.jobSkills.map((skill) => (
                                <li
                                  className="more-down__item"
                                  key={skill?._id}
                                >
                                  {skill?.skillName}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <p className="more-down__more">
                            {jobCard?.moreInfo[0]?.jobText}
                          </p>
                        </div>
                        {/* More down - Job requirements */}
                        <div className="job-req">
                          <ul className="job-req__list">
                            <li className="job-req__item">
                              {jobCard?.jobType}
                            </li>
                            <li className="job-req__item">
                              {jobCard?.jobCooperate ? "Contract" : "Intern"}
                            </li>
                            <li className="job-req__item">
                              {jobCard?.jobPrice}&nbsp;
                              {jobCard?.moneyTypeId?.moneyType}
                            </li>
                          </ul>
                        </div>
                        <button
                          onClick={handleApply}
                          className="more-upper__applyBtn"
                        >
                          Apply for this job
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="job-posts__static job-posts__static-view compatible ">
                    <img
                      className="layer-img"
                      src={Layer}
                      alt="Layer img"
                      width={145}
                    />
                    <p className="preview__text">
                      Click on a job to preview its full job details here
                    </p>
                  </div>
                )}
              </div>

              {/* </div> */}
            </div>
          ) : (
            //* Shows this message if no any job
            <p className="no-results-message">
              No jobs found matching your search criteria.
            </p>
          )}
        </div>
      </div>
      <div className="jobs__footer-container">
        <Footer />
      </div>
    </>
  );
};
