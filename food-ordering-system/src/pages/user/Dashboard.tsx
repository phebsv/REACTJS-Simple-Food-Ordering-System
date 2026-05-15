import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import BgFood from "../../components/BgFood";
import burger1 from "../../assets/burger1.png";
import burger2 from "../../assets/burger2.png";
import chicken1 from "../../assets/chicken1.png";
import pizza1 from "../../assets/pizza1.png";
import "./Dashboard.css";

const carouselSlides = [
  {
    kicker: "Crispy, Every Bite Taste",
    lines: ["HOT SPICY", "CHICKEN", "BURGER"],
    offer: "Limited Offer / PHP 5",
    image: burger1,
    alt: "Chicken burger",
  },
  {
    kicker: "Fresh From The Oven",
    lines: ["CHEESY", "PIZZA", "SLICE"],
    offer: "Made hot for every craving",
    image: pizza1,
    alt: "Pizza",
  },
  {
    kicker: "Golden And Juicy",
    lines: ["CRISPY", "CHICKEN", "MEAL"],
    offer: "Perfect for lunch or dinner",
    image: chicken1,
    alt: "Chicken meal",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % carouselSlides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  const showPreviousSlide = () => {
    setActiveSlide(
      (current) =>
        (current - 1 + carouselSlides.length) % carouselSlides.length,
    );
  };

  const showNextSlide = () => {
    setActiveSlide((current) => (current + 1) % carouselSlides.length);
  };

  const slide = carouselSlides[activeSlide];

  return (
    <>
      <Navbar title="DASHBOARD" showNavLinks={true} />
      <div className="dashboard-container">
        <BgFood />
        <div className="dashboard-intro">
          <section
            className="dashboard-offer"
            aria-roledescription="carousel"
            aria-label="Featured food offers"
          >
            <button
              type="button"
              className="dashboard-carousel-control dashboard-carousel-prev"
              onClick={showPreviousSlide}
              aria-label="Previous offer"
            >
              {"<"}
            </button>

            <div className="dashboard-text">
              <div className="dashboard-hot">{slide.kicker}</div>
              <div className="dashboard-spicy">
                {slide.lines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </div>
              <div className="dashboard-limited">{slide.offer}</div>
              <button
                onClick={() => navigate("/menu")}
                className="dashboard-order-btn"
              >
                Order Now
              </button>
            </div>

            <img
              key={slide.image}
              src={slide.image}
              alt={slide.alt}
              className="dashboard-burger-img"
            />

            <button
              type="button"
              className="dashboard-carousel-control dashboard-carousel-next"
              onClick={showNextSlide}
              aria-label="Next offer"
            >
              {">"}
            </button>

            <div className="dashboard-dots">
              {carouselSlides.map((item, index) => (
                <button
                  key={item.alt}
                  type="button"
                  className={`dashboard-dot ${
                    index === activeSlide ? "dashboard-dot-active" : ""
                  }`}
                  onClick={() => setActiveSlide(index)}
                  aria-label={`Show ${item.alt} offer`}
                  aria-current={index === activeSlide}
                />
              ))}
            </div>
          </section>

          <div className="dashboard-popular">
            <p className="dashboard-popular-kicker">The Best</p>
            <h2>Popular Food Items</h2>
            <div className="dashboard-popular-grid">
              <div className="dashboard-food-card">
                <img src={pizza1} alt="Pizza" />
                <button onClick={() => navigate("/menu")}>Order Now</button>
              </div>
              <div className="dashboard-food-card">
                <img src={burger2} alt="Burger meal" />
                <button onClick={() => navigate("/menu")}>Order Now</button>
              </div>
              <div className="dashboard-food-card">
                <img src={chicken1} alt="Chicken meal" />
                <button onClick={() => navigate("/menu")}>Order Now</button>
              </div>
            </div>
          </div>

          <div className="dashboard-service">
            <p className="dashboard-service-kicker">Food Processing</p>
            <h1 className="dashboard-welcome">How We Serve You?</h1>
            <div className="dashboard-service-grid">
              <div className="dashboard-service-item">
                <h3>Cooking With Care</h3>
                <p>Fresh food prepared carefully for every order.</p>
              </div>
              <div className="dashboard-service-item featured">
                <h3>Quickly Delivery</h3>
                <p>Fast checkout and delivery for a smoother food experience.</p>
              </div>
              <div className="dashboard-service-item">
                <h3>Choose Food</h3>
                <p>Browse favorites and pick the meal you like best.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
