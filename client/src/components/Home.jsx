import { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Home = () => {
  const { user } = useContext(AuthContext);

  // Set document title for better SEO
  useEffect(() => {
    document.title = "FreelanceFlow | Connect with Top Talent";
  }, []);

  return (
    <div className="bg-base-200">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated background patterns */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary opacity-10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 space-y-8 text-center lg:text-left">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Find the perfect{" "}
                <span className="text-primary">freelance services</span> for
                your business
              </h1>

              <p className="text-lg text-base-content/70 max-w-xl">
                Connect with talented professionals and get high-quality work
                done at affordable prices, all in one secure platform.
              </p>

              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                {!user ? (
                  <>
                    <Link to="/register" className="btn btn-primary btn-lg">
                      Get Started
                    </Link>
                    <Link to="/categories" className="btn btn-outline btn-lg">
                      Explore Services
                    </Link>
                  </>
                ) : user.role === "client" ? (
                  <>
                    <Link to="/categories" className="btn btn-primary btn-lg">
                      Find Services
                    </Link>
                    <Link to="/orders" className="btn btn-outline btn-lg">
                      My Orders
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/my-services" className="btn btn-primary btn-lg">
                      Manage Services
                    </Link>
                    <Link to="/earnings" className="btn btn-outline btn-lg">
                      View Earnings
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="lg:w-1/2 relative">
              <div className="relative z-10">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
                  alt="Freelancers collaborating"
                  className="rounded-xl shadow-2xl"
                />
              </div>
              <div className="absolute -top-4 -right-4 bg-accent/20 backdrop-blur-sm rounded-xl w-32 h-32 flex flex-col items-center justify-center z-20 shadow-xl">
                <span className="text-3xl font-bold">100+</span>
                <span className="text-sm">Categories</span>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-primary/20 backdrop-blur-sm rounded-xl w-32 h-32 flex flex-col items-center justify-center z-20 shadow-xl">
                <span className="text-3xl font-bold">24/7</span>
                <span className="text-sm">Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-base-100 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How FreelanceFlow Works
            </h2>
            <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
              Our platform makes it easy to find freelance services or offer
              your expertise
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="card-body items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-content text-2xl font-bold mb-4">
                  1
                </div>
                <h3 className="card-title text-xl">Browse Services</h3>
                <p className="text-base-content/70">
                  Explore diverse categories and find the services that match
                  your needs
                </p>
              </div>
            </div>

            <div className="card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="card-body items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-content text-2xl font-bold mb-4">
                  2
                </div>
                <h3 className="card-title text-xl">Place an Order</h3>
                <p className="text-base-content/70">
                  Select a service, discuss details, and make a secure payment
                </p>
              </div>
            </div>

            <div className="card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="card-body items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-content text-2xl font-bold mb-4">
                  3
                </div>
                <h3 className="card-title text-xl">Receive Quality Work</h3>
                <p className="text-base-content/70">
                  Get your completed work, request revisions if needed, and
                  release payment
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Popular Categories
            </h2>
            <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
              Discover our most sought-after service categories
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              "Design & Creative",
              "Digital Marketing",
              "Web Development",
              "Content Writing",
              "Video & Animation",
              "Music & Audio",
              "Programming & Tech",
              "Business",
            ].map((category, index) => (
              <Link
                key={index}
                to="/categories"
                className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
              >
                <div className="card-body items-center text-center">
                  <h3 className="card-title">{category}</h3>
                  <div className="mt-4">
                    <span className="btn btn-sm btn-outline btn-primary">
                      Browse
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/categories" className="btn btn-primary">
              View All Categories
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-base-100 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Our Users Say
            </h2>
            <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
              Don't take our word for it – hear from our satisfied clients and
              freelancers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Marketing Director",
                text: "FreelanceFlow has been a game-changer for our company. We've found amazing talent quickly and the quality of work has been exceptional.",
                image: "https://i.pravatar.cc/150?img=1",
              },
              {
                name: "Michael Chen",
                role: "Freelance Developer",
                text: "Since joining as a freelancer, I've been able to grow my client base and increase my income. The platform is intuitive and payments are always on time.",
                image: "https://i.pravatar.cc/150?img=8",
              },
              {
                name: "Emily Rodriguez",
                role: "Small Business Owner",
                text: "I was hesitant to hire freelancers online, but FreelanceFlow made it simple and secure. I've completed over 20 projects and keep coming back.",
                image: "https://i.pravatar.cc/150?img=5",
              },
            ].map((testimonial, index) => (
              <div key={index} className="card bg-base-200 shadow-xl">
                <div className="card-body">
                  <div className="flex items-center mb-4">
                    <div className="avatar">
                      <div className="w-12 h-12 rounded-full">
                        <img src={testimonial.image} alt={testimonial.name} />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="font-bold">{testimonial.name}</h3>
                      <p className="text-sm text-base-content/70">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  <p className="italic">"{testimonial.text}"</p>
                  <div className="mt-4 flex">
                    <div className="rating rating-sm">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <input
                          key={star}
                          type="radio"
                          name={`rating-${index}`}
                          className="mask mask-star-2 bg-primary"
                          checked={star === 5}
                          readOnly
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-primary/5"></div>
        <div className="container mx-auto px-4">
          <div className="stats stats-vertical lg:stats-horizontal shadow w-full bg-base-100">
            <div className="stat">
              <div className="stat-figure text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="inline-block w-8 h-8 stroke-current"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  ></path>
                </svg>
              </div>
              <div className="stat-title">Happy Clients</div>
              <div className="stat-value text-primary">25.6K</div>
              <div className="stat-desc">21% more than last year</div>
            </div>

            <div className="stat">
              <div className="stat-figure text-secondary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="inline-block w-8 h-8 stroke-current"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  ></path>
                </svg>
              </div>
              <div className="stat-title">Completed Projects</div>
              <div className="stat-value text-secondary">84.2K</div>
              <div className="stat-desc">14% more than last month</div>
            </div>

            <div className="stat">
              <div className="stat-figure text-accent">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="inline-block w-8 h-8 stroke-current"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  ></path>
                </svg>
              </div>
              <div className="stat-title">Active Freelancers</div>
              <div className="stat-value text-accent">12K+</div>
              <div className="stat-desc">Across 100+ countries</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-content">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to get started?
              </h2>
              <p className="text-lg opacity-90 max-w-xl">
                Join thousands of clients and freelancers who are already using
                FreelanceFlow to grow their businesses.
              </p>
            </div>

            <div className="flex gap-4">
              {!user ? (
                <>
                  <Link to="/register" className="btn btn-secondary btn-lg">
                    Sign Up for Free
                  </Link>
                  <Link
                    to="/login"
                    className="btn btn-outline btn-lg text-primary-content border-primary-content hover:bg-primary-content hover:text-primary"
                  >
                    Log In
                  </Link>
                </>
              ) : user.role === "client" ? (
                <Link to="/categories" className="btn btn-secondary btn-lg">
                  Find Services Now
                </Link>
              ) : (
                <Link to="/my-services" className="btn btn-secondary btn-lg">
                  Manage Your Services
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose FreelanceFlow
            </h2>
            <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
              Our platform offers unique benefits for both clients and
              freelancers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Secure Payments",
                description:
                  "Your money is held safely until you're satisfied with the work delivered",
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                ),
              },
              {
                title: "Quality Guaranteed",
                description:
                  "Every service comes with a satisfaction guarantee and revision options",
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                ),
              },
              {
                title: "24/7 Support",
                description:
                  "Our customer support team is always available to help with any issues",
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                ),
              },
              {
                title: "Transparent Pricing",
                description:
                  "No hidden fees or surprises - see exactly what you'll pay upfront",
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                ),
              },
              {
                title: "Vetted Professionals",
                description:
                  "Our freelancers go through a verification process to ensure quality",
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                ),
              },
              {
                title: "Global Talent Pool",
                description:
                  "Access skilled professionals from around the world in every field",
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h.5A2.5 2.5 0 0020 5.5v-1.5M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h.5A2.5 2.5 0 0020 5.5V3.935m0 0A2.5 2.5 0 0017.5 1h-11A2.5 2.5 0 004 3.935"
                    />
                  </svg>
                ),
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
              >
                <div className="card-body">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="card-title text-xl">{feature.title}</h3>
                  <p className="text-base-content/70">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-base-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
              Get answers to common questions about using FreelanceFlow
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="join join-vertical w-full">
              {[
                {
                  question: "How do I get started as a client?",
                  answer:
                    "Sign up for a free account, browse through available services in your desired category, and place an order with the freelancer of your choice. You'll only pay once you're satisfied with the delivered work.",
                },
                {
                  question: "How do I become a freelancer on FreelanceFlow?",
                  answer:
                    "Register as a freelancer, create a compelling profile, and start offering your services by creating detailed service listings. Once approved, your services will be visible to potential clients worldwide.",
                },
                {
                  question: "How does payment work?",
                  answer:
                    "We use a secure escrow system. Clients pay upfront, but the money is only released to the freelancer once the client approves the completed work. This protects both parties and ensures quality delivery.",
                },
                {
                  question: "What if I'm not satisfied with the work?",
                  answer:
                    "Most services come with revision options. If you're still not satisfied after revisions, you can contact our support team who will help resolve the issue according to our satisfaction guarantee policy.",
                },
                {
                  question: "How much does it cost to join?",
                  answer:
                    "Joining FreelanceFlow is completely free for both clients and freelancers. Clients pay only for the services they purchase, and freelancers pay a small commission fee on completed orders.",
                },
              ].map((faq, index) => (
                <div
                  key={index}
                  className="collapse collapse-arrow join-item border border-base-300"
                >
                  <input
                    type="radio"
                    name="faq-accordion"
                    defaultChecked={index === 0}
                  />
                  <div className="collapse-title text-xl font-medium">
                    {faq.question}
                  </div>
                  <div className="collapse-content">
                    <p className="text-base-content/80">{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <p className="mb-4">Still have questions?</p>
              <Link to="/contact" className="btn btn-outline btn-primary">
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
