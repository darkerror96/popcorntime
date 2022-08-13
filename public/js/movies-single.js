(function () {
  function createCommentBlock(postCommentResponse) {
    let newCommentBlock = `
    <div class="review_block">
    <span class="review_comment"> ${postCommentResponse.comment} </span>
    <span class="review_rating"> Rated:
      <span class="rating">${postCommentResponse.rating}</span>
    </span>
    <br />
    <span class="review_author">added by ${postCommentResponse.user.username} on ${postCommentResponse.date}</span>
    <span class="review_likes_and_dislikes">
      <span title="${postCommentResponse.likes}" class="review_likes" id="likesCount_${postCommentResponse.commentId}">
        Likes:        
        0        
      </span>
      <span> | </span>
      <span title="${postCommentResponse.dislikes}" class="review_dislikes" id="dislikesCount_${postCommentResponse.commentId}">
        Dislikes:
        0
      </span>
    </span>

    <p>        
    <span class="review_action" style="color: green" id="like_${postCommentResponse.commentId}" 
    onclick="reviewAction('like', '${postCommentResponse.commentId}', this)"
    >Like</span>
    <span class="review_action" style="color: red" id="dislike_${postCommentResponse.commentId}">Dislike</span>    
  </p>
  <div id="errorActionDiv_${postCommentResponse.commentId}" class="alert alert-danger hidden" role="alert">
  </div>
  </div>
    `;

    return newCommentBlock;
  }

  function addEventListenersToActionButtons() {
    for (let reviewActionButton of reviewActionButtons) {
      // Note: Any updates to this must be copied to the createCommentBlock() function
      reviewActionButton.addEventListener("click", (event) => {
        let actionAndCommentId = reviewActionButton.id.split("_");
        let action = actionAndCommentId[0];
        let commentId = actionAndCommentId[1];

        reviewAction(action, commentId, reviewActionButton);
      });
    }
  }

  function reviewAction(action, commentId, reviewActionButton) {
    $("body").css("cursor", "progress");
    let movieId = movieIdField.value;
    let errorActionDiv = $(`#errorActionDiv_${commentId}`);

    let postReviewActionInfo = {
      method: "POST",
      url: `/movies/${movieId}/comment/${commentId}/${action}`,
      contentType: "application/json",
    };

    $.ajax(postReviewActionInfo)
      .then(function (responseMessage) {
        let postReviewActionResponse = $(responseMessage)[0];
        errorActionDiv.addClass("hidden");

        if (action === "like") {
          reviewActionButton.innerHTML = "Undo 'Like'";
          reviewActionButton.style = "color: orange";
          reviewActionButton.id = `unlike_${commentId}`;

          let currentCommentLikes =
            postReviewActionResponse.currentCommentLikes;
          let likesWithUserName = postReviewActionResponse.likesWithUserName;
          let likesCountSpan = document.getElementById(
            `likesCount_${commentId}`
          );
          likesCountSpan.innerHTML = `Likes: ${currentCommentLikes}`;
          likesCountSpan.title = likesWithUserName;

          return;
        }
        if (action === "unlike") {
          reviewActionButton.innerHTML = "Like";
          reviewActionButton.style = "color: green";
          reviewActionButton.id = `like_${commentId}`;

          let currentCommentLikes =
            postReviewActionResponse.currentCommentLikes;
          let likesWithUserName = postReviewActionResponse.likesWithUserName;
          let likesCountSpan = document.getElementById(
            `likesCount_${commentId}`
          );
          likesCountSpan.innerHTML = `Likes: ${currentCommentLikes}`;
          likesCountSpan.title = likesWithUserName;

          return;
        }
        if (action === "dislike") {
          reviewActionButton.innerHTML = "Undo 'Dislike";
          reviewActionButton.style = "color: orange";
          reviewActionButton.id = `undislike_${commentId}`;

          let currentCommentDislikes =
            postReviewActionResponse.currentCommentDislikes;
          let dislikesWithUserName =
            postReviewActionResponse.dislikesWithUserName;
          let dislikesCountSpan = document.getElementById(
            `dislikesCount_${commentId}`
          );
          dislikesCountSpan.innerHTML = `Dislikes: ${currentCommentDislikes}`;
          dislikesCountSpan.title = dislikesWithUserName;

          return;
        }
        if (action === "undislike") {
          reviewActionButton.innerHTML = "Dislike";
          reviewActionButton.style = "color: red";
          reviewActionButton.id = `dislike_${commentId}`;

          let currentCommentDislikes =
            postReviewActionResponse.currentCommentDislikes;
          let dislikesWithUserName =
            postReviewActionResponse.dislikesWithUserName;
          let dislikesCountSpan = document.getElementById(
            `dislikesCount_${commentId}`
          );
          dislikesCountSpan.innerHTML = `Dislikes: ${currentCommentDislikes}`;
          dislikesCountSpan.title = dislikesWithUserName;
          return;
        }
      })
      .fail(function (data, textStatus, xhr) {
        if (data.status == 409) {
          errorActionDiv.text("You cannot like and dislike the same message");
          errorActionDiv.removeClass("hidden");
        }
      });

    $("body").css("cursor", "default");
  }

  const submitReviewForm = document.getElementById("reviewForm");
  const submitReviewButton = document.getElementById("btn-review");
  const movieIdField = document.getElementById("movieId");
  const reviewActionButtons = document.getElementsByClassName("review_action");
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

        addEventListenersToActionButtons();

        let newAverage = postCommentResponse.newAverage;
        let newNumOfReviews = postCommentResponse.newNumOfReviews;

        avg_ratingsSpan.text(newAverage);
        total_reviewsSpan.text(`(out of ${newNumOfReviews} reviews)`);
      })
      .fail(function (data, textStatus, xhr) {
        errorMessageDiv.text(data.responseText);
        errorMessageDiv.removeClass("hidden");
      });

    $("body").css("cursor", "default");
  });

  addEventListenersToActionButtons();
})();
