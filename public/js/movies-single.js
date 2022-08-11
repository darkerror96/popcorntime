(function () {
  function createCommentBlock(postCommentResponse) {
    console.log(postCommentResponse);
    let newCommentBlock = `
    <div class="review_block">
    <span class="review_comment"> ${postCommentResponse.comment} </span>
    <span class="review_rating"> Rated:
      <span class="rating">${postCommentResponse.rating}</span>
    </span>
    <br />
    <span class="review_author">added by ${postCommentResponse.user} on ${postCommentResponse.date}</span>
    <span class="review_likes_and_dislikes">
      <span title="${postCommentResponse.likes}" class="review_likes">
        Likes:        
        0        
      </span>
      <span> | </span>
      <span title="${postCommentResponse.dislikes}" class="review_dislikes">
        Dislikes:
        0
      </span>
    </span>
  </div>
    `;
    return newCommentBlock;
  }

  function reviewAction(action, commentId, reviewActionButton) {
    let movieId = movieIdField.value;
    console.log(action, commentId, movieId);

    let postReviewActionInfo = {
      method: "POST",
      url: `/movies/${movieId}/comment/${commentId}/${action}`,
      contentType: "application/json",
    };

    $.ajax(postReviewActionInfo)
      .then(function (responseMessage) {
        let postReviewActionResponse = $(responseMessage)[0];
        console.log("success", postReviewActionResponse);

        if (action === "like") {
          reviewActionButton.innerHTML = "Undo 'Like'";
          reviewActionButton.style = "color: orange";
          reviewActionButton.id = `unlike_${commentId}`;
          return;
        }
        if (action === "unlike") {
          reviewActionButton.innerHTML = "Like";
          reviewActionButton.style = "color: green";
          reviewActionButton.id = `like_${commentId}`;
          return;
        }
        if (action === "dislike") {
          reviewActionButton.innerHTML = "Undo 'Dislike";
          reviewActionButton.style = "color: orange";
          reviewActionButton.id = `undislike_${commentId}`;
          return;
        }
        if (action === "undislike") {
          reviewActionButton.innerHTML = "Dislike";
          reviewActionButton.style = "color: red";
          reviewActionButton.id = `dislike_${commentId}`;
          return;
        }
      })
      .fail(function (data, textStatus, xhr) {
        console.log("failure", data, textStatus, xhr);
        console.log("failure", data.status);
        console.log("failure", textStatus);
        console.log("failure", xhr);
      });
  }

  const submitReviewForm = document.getElementById("reviewForm");
  const submitReviewButton = document.getElementById("btn-review");
  const movieIdField = document.getElementById("movieId");
  const reviewActionButtons = document.getElementsByClassName("review_action");
  console.log("reviewActionButtons", reviewActionButtons);
  submitReviewButton.addEventListener("submit", (event) => {
    event.preventDefault();
  });

  submitReviewButton.addEventListener("click", (event) => {
    $("body").css("cursor", "progress");
    event.preventDefault();
    let rating = $("#ratingInput").val();
    let comment = $("#textAreaComment").val();
    let movieId = movieIdField.value;
    let errorMessageDiv = $("#errorMessageDiv");
    let reviews_dd = $("#reviews_dd");
    let avg_ratingsSpan = $("#avg_rating");
    let total_reviewsSpan = $("#total_reviews");

    let postCommentCallInfo = {
      method: "POST",
      url: `/movies/${movieId}/comment`,
      contentType: "application/json",
      data: JSON.stringify({
        rating: rating,
        comment: comment,
      }),
    };

    $.ajax(postCommentCallInfo)
      .then(function (responseMessage) {
        let postCommentResponse = $(responseMessage)[0];
        submitReviewForm.reset();
        errorMessageDiv.text();
        errorMessageDiv.addClass("hidden");
        let newCommentBlock = createCommentBlock(postCommentResponse);
        reviews_dd.append(newCommentBlock);

        let newAverage = postCommentResponse.newAverage;
        let newNumOfReviews = postCommentResponse.newNumOfReviews;

        avg_ratingsSpan.text(newAverage);
        total_reviewsSpan.text(`(out of ${newNumOfReviews} reviews)`);
      })
      .fail(function (data, textStatus, xhr) {
        //This shows status code eg. 403
        console.log("error", data.status);
        console.log("error data", data);
        console.log("error data", data.responseText);
        //This shows status message eg. Forbidden
        console.log("STATUS: " + xhr);

        errorMessageDiv.text(data.responseText);
        errorMessageDiv.removeClass("hidden");
      });
    $("body").css("cursor", "default");
  });

  // reviewActionButtons.forEach((reviewActionButton) => {
  //   reviewActionButton.addEventListener("click", (event) => {
  //     console.log(reviewActionButton);
  //     console.log(event);
  //   });
  // });

  for (let reviewActionButton of reviewActionButtons) {
    reviewActionButton.addEventListener("click", (event) => {
      console.log(reviewActionButton);
      console.log(reviewActionButton.id);
      console.log(event);
      let actionAndCommentId = reviewActionButton.id.split("_");
      let action = actionAndCommentId[0];
      let commentId = actionAndCommentId[1];

      reviewAction(action, commentId, reviewActionButton);
    });
  }
})();
