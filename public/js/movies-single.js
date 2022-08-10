(function () {
  function isPrime(fibonacciNumber) {
    if (fibonacciNumber < 2) {
      return false;
    }
    for (let i = 2; i < fibonacciNumber / 2; i++) {
      if (fibonacciNumber % i == 0) return false;
    }
    console.log("22");
    return true;
  }

  const fibPrimeCheckerForm = document.getElementById("btn-review");
  fibPrimeCheckerForm.addEventListener("submit", (event) => {
    event.preventDefault();

    console.log("asdsdads");
  });

  fibPrimeCheckerForm.addEventListener("click", (event) => {
    event.preventDefault();
    let rating = $("#ratingInput").val();
    let comment = $("#textAreaComment").val();

  });
})();
