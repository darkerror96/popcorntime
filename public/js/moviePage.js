(function () {

  function createCommentBlock(postCommentResponse) {
    let newCommentBlock = `
    <div class="review_block" style="border: 1px solid orange">
      <span class="review_comment"> ${postCommentResponse.comment} </span>
      <span class="review_rating"> Rated:
        <span class="rating">${postCommentResponse.rating}</span>
      </span>
      <br />
      <span class="review_author">added by ${postCommentResponse.user.username} on ${postCommentResponse.timestamp}</span>
      <span class="review_likes_and_dislikes">
        <span title="${postCommentResponse.likes}" class="review_likes" id="likesCount_${postCommentResponse.commentId}">
          Likes: 0        
        </span>
        <span> | </span>
        <span title="${postCommentResponse.dislikes}" class="review_dislikes" id="dislikesCount_${postCommentResponse.commentId}">
          Dislikes: 0
        </span>
      </span>
      <p>        
        <span class="review_action" style="color: rgb(0, 100, 0)" id="like_${postCommentResponse.commentId}" 
          onclick="reviewAction('like', '${postCommentResponse.commentId}', this)">Like</span>
        <span class="review_action" style="color: rgb(200, 0, 0)" id="dislike_${postCommentResponse.commentId}">Dislike</span>    
      </p>
      <div id="errorActionDiv_${postCommentResponse.commentId}" class="alert alert-danger hidden" role="alert"></div>
    </div>
    `;

    return newCommentBlock;
  }

  function checkNumber(val, variableName, minValue, maxValue) {
    if (!val) {
      throw `Error: You must provide a number for ${variableName} between ${minValue} and ${maxValue}!`;
    }

    try {
      val = parseFloat(val);
    } catch (e) {
      throw `Error: ${
        variableName || "provided variable"
      } can't be parsed to a number`;
    }

    if (val < minValue) {
      throw `Error: ${
        variableName || "provided variable"
      } must not be lesser than ${minValue}`;
    }

    if (val > maxValue) {
      throw `Error: ${
        variableName || "provided variable"
      } must not be greater than ${maxValue}`;
    }
    return val;
  }

  function checkString(strVal, varName) {
    if (!strVal) throw `Error: You must provide value for ${varName}!`;
    if (typeof strVal !== "string") throw `Error: ${varName} must be a string!`;
    strVal = strVal.trim();
    if (strVal.length === 0)
      throw `Error: Empty text or text with just spaces is not valid for ${varName}`;
    if (!isNaN(strVal))
      throw `Error: ${strVal} is not a valid value for ${varName} as it only contains digits`;
    const regexNoSymbols = /^[a-zA-Z0-9À-ÖØ-öø-ÿ.,\-\'_! ]*$/;
    const regexHasAlphabets = /[a-zA-Z]/;
    if (!regexNoSymbols.test(strVal)) {
      throw `Error: Only alphabets, numbers, period, dash, and underscore are allowed for ${varName}`;
    }
    if (!regexHasAlphabets.test(strVal)) {
      throw `Error: No alphabets found in ${varName}`;
    }
    return strVal;
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
          reviewActionButton.style = "color: rgb(160, 60, 0)";
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
          reviewActionButton.style = "color: rgb(0, 100, 0)";
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
          reviewActionButton.style = "color: rgb(160, 60, 0)";
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
          reviewActionButton.style = "color: rgb(200, 0, 0)";
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
        } else if (data.status == 403) {
          errorActionDiv.text("You need to be logged in to react to reviews");
          errorActionDiv.removeClass("hidden");
        } else {
          errorActionDiv.text(
            "Unable to connect to server. Please try again later."
          );
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

    let errorMessageDiv = $("#errorMessageDiv");
    try {
      let rating = $("#ratingInput").val();
      rating = checkNumber(rating, "rating", 1, 10);
      let comment = $("#textAreaComment").val();
      comment = checkString(comment, "comment");
      let movieId = movieIdField.value;

      let avg_ratingsSpan = $("#avg_rating");
      let total_reviewsSpan = $("#total_reviews");

      let reviewsHeader = $("#reviewsHeader");

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

          let noReviewsYetBlock = document.getElementById("reviewsAbsent");
          if (noReviewsYetBlock) {
            noReviewsYetBlock.remove();
            reviewsHeader.after(`<dd id="reviewsPresent"></dd>`);
          }
          let existingReviews = $("#reviewsPresent");
          existingReviews.append(newCommentBlock);

          addEventListenersToActionButtons();

          let newAverage = postCommentResponse.newAverage;
          let newNumOfReviews = postCommentResponse.newNumOfReviews;

          avg_ratingsSpan.text(newAverage);
          total_reviewsSpan.text(`(out of ${newNumOfReviews} reviews)`);
        })
        .fail(function (data, textStatus, xhr) {
          if (data.status == 403) {
            errorMessageDiv.text("You need to be logged in to post reviews");
            errorMessageDiv.removeClass("hidden");
          } else if (data.status == 400) {
            errorMessageDiv.text(data.responseText);
            errorMessageDiv.removeClass("hidden");
          } else {
            errorMessageDiv.text(
              "Unable to connect to server. Please try again later."
            );
            errorMessageDiv.removeClass("hidden");
          }
        });
    } catch (e) {
      errorMessageDiv.text(e);
      errorMessageDiv.removeClass("hidden");
    }

    $("body").css("cursor", "default");
  });

  addEventListenersToActionButtons();
})();
