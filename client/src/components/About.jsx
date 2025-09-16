import { useEffect } from "react";
import { Link } from "react-router-dom";

const About = () => {
  useEffect(() => {
    document.title = "About Us | FreelanceFlow";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-base-200 min-h-screen">
      {/* Hero Section */}
      <section className="bg-base-100 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">About FreelanceFlow</h1>
              <p className="text-xl text-base-content/80 mb-6">
                Connecting talented freelancers with clients worldwide since 2023.
              </p>
              <p className="mb-6 text-base-content/70">
                FreelanceFlow was founded with a simple mission: to create a platform 
                where skilled professionals can offer their services globally, and 
                businesses can find the perfect talent for their projects—all in a 
                secure, transparent environment.
              </p>
              <div className="flex gap-4">
                <Link to="/categories" className="btn btn-primary">
                  Explore Services
                </Link>
                <Link to="/register" className="btn btn-outline">
                  Join Us
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1587&q=80" 
                alt="Team working together" 
                className="rounded-xl shadow-xl w-full h-auto max-w-lg mx-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Story</h2>
            <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
              How we evolved from an idea to a thriving freelance marketplace
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">The Beginning</h3>
                <p className="text-base-content/70">
                  FreelanceFlow started as a solution to a problem our founders experienced—the 
                  difficulty of finding quality freelance work and reliable talent online.
                </p>
              </div>
            </div>
            
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">Our Growth</h3>
                <p className="text-base-content/70">
                  What began as a small platform has grown into a vibrant community of 
                  thousands of freelancers and clients from over 50 countries.
                </p>
              </div>
            </div>
            
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">Today & Beyond</h3>
                <p className="text-base-content/70">
                  Today, we're focused on innovation and expanding our offerings while 
                  maintaining our commitment to quality, security, and user satisfaction.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="bg-base-100 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Values</h2>
            <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex gap-4">
              <div className="bg-primary/10 p-4 rounded-lg h-fit">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Trust & Safety</h3>
                <p className="text-base-content/70">
                  We prioritize creating a secure environment with protected payments, 
                  identity verification, and continuous platform monitoring.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-primary/10 p-4 rounded-lg h-fit">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Quality & Efficiency</h3>
                <p className="text-base-content/70">
                  We're committed to helping clients find top talent quickly, and 
                  enabling freelancers to deliver exceptional work on schedule.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-primary/10 p-4 rounded-lg h-fit">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Community</h3>
                <p className="text-base-content/70">
                  We foster a supportive global community where freelancers can grow 
                  professionally and clients can build lasting relationships.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-primary/10 p-4 rounded-lg h-fit">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">User Experience</h3>
                <p className="text-base-content/70">
                  We're dedicated to creating an intuitive platform that makes finding 
                  work or talent as seamless and enjoyable as possible.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Team</h2>
            <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
              Meet the dedicated people behind FreelanceFlow
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                name: "Sarah Chen",
                role: "Co-Founder & CEO",
                image: "https://i.pravatar.cc/300?img=5"
              },
              {
                name: "Michael Rodriguez",
                role: "Co-Founder & CTO",
                image: "https://i.pravatar.cc/300?img=8"
              },
              {
                name: "David Kim",
                role: "Head of Product",
                image: "https://i.pravatar.cc/300?img=12"
              },
              {
                name: "Jessica Patel",
                role: "Head of Marketing",
                image: "https://i.pravatar.cc/300?img=20"
              }
            ].map((member, index) => (
              <div key={index} className="card bg-base-100 shadow-xl">
                <figure className="px-4 pt-4">
                  <img src={member.image} alt={member.name} className="rounded-xl w-full object-cover aspect-square" />
                </figure>
                <div className="card-body items-center text-center p-4">
                  <h3 className="card-title">{member.name}</h3>
                  <p className="text-base-content/70">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-content py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Join Our Community</h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
            Whether you're looking for quality services or want to offer your skills, 
            FreelanceFlow is the platform for you.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="btn btn-secondary btn-lg">
              Sign Up Free
            </Link>
            <Link to="/categories" className="btn btn-outline btn-lg text-primary-content border-primary-content">
              Explore Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;