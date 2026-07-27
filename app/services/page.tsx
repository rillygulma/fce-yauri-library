"use client";

const ServicesPage = () => {
  return (
    <div className="min-h-screen py-16 px-2 sm:px-6 lg:px-24">
      <div className="text-center">
        {/* Title */}
        <h1 className="mb-10 text-3xl font-bold text-blue-700 sm:text-4xl lg:text-5xl">
          Our Services
        </h1>

        {/* WORKING HOURS */}
        <section className="mb-16 flex flex-col items-center">
          <h2 className="mb-6 rounded bg-blue-700 px-4 py-2 text-xl font-bold text-white sm:text-2xl">
            Working Hours
          </h2>

          <p className="mb-6 text-center text-lg font-medium text-gray-700">
            We are open for consultation and work on the following schedule:
          </p>

          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-md">
            <ul className="space-y-4 text-sm sm:text-lg font-semibold">
              {[
                ["Monday", "8:00AM - 10:00PM"],
                ["Tuesday", "8:00AM - 10:00PM"],
                ["Wednesday", "8:00AM - 10:00PM"],
                ["Thursday", "8:00AM - 10:00PM"],
                ["Friday", "8:00AM - 1:00PM"],
                ["Re-Open", "4:00PM - 10:00PM"],
                ["Saturday", "9:00AM - 6:00PM"],
              ].map(([day, time]) => (
                <li key={day} className="flex justify-between">
                  <span className="text-gray-800">{day}</span>
                  <span className="text-green-700">{time}</span>
                </li>
              ))}

              <li className="flex justify-between">
                <span className="italic text-gray-800">
                  Sunday/Public Holiday
                </span>
                <span className="rounded bg-red-700 px-2 py-1 font-bold text-white">
                  Closed
                </span>
              </li>
            </ul>
          </div>

          {/* Vacation */}
          <div className="mt-10 w-full max-w-2xl rounded-lg bg-white p-6 shadow-md">
            <h3 className="mb-4 border-b pb-2 text-xl font-bold text-blue-700">
              During Vacation
            </h3>

            <ul className="space-y-4 text-sm sm:text-lg font-semibold">
              <li className="flex justify-between">
                <span>Monday – Thursday</span>
                <span>9:00AM – 4:00PM</span>
              </li>

              <li className="flex justify-between">
                <span>Friday</span>
                <span>9:00AM – 1:00PM</span>
              </li>

              <li className="flex justify-between">
                <span>Saturday</span>
                <span>9:00AM – 2:00PM</span>
              </li>

              <li className="flex justify-between">
                <span className="italic">Sunday/Public Holiday</span>
                <span className="rounded bg-red-700 px-2 py-1 font-bold text-white">
                  Closed
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* REFERENCE SERVICE */}
        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-bold text-blue-700 sm:text-3xl">
            Reference Service
          </h2>

          <p className="mx-auto text-lg max-w-3xl text-gray-700">
            Our library provides in-person and e-reference services through
            Chat-A-Librarian, email, and Zoom virtual meetings. To schedule a
            Zoom meeting, please contact the Reference Librarian.
          </p>
        </section>

        {/* DISABILITY SUPPORT */}
        <section>
          <h2 className="mb-6 text-2xl font-bold text-blue-700 sm:text-3xl">
            Support for Users with Disabilities
          </h2>

          <div className="mx-auto max-w-3xl text-lg text-left">
            <p className="mb-6 text-gray-700">
              The College Library renders inclusive services to users with
              disabilities:
            </p>

            <ol className="list-decimal space-y-3 pl-5 text-gray-700">
              <li>
                Provision of assistive tools on students’ personal devices
              </li>
              <li>Scan and convert materials to braille or audio</li>
              <li>Conversion of resources to accessible formats</li>
              <li>Research assistance via appointment with librarians</li>
              <li>Library orientation and information literacy programs</li>
              <li>Extended loan periods</li>
              <li>Provision of ramps for wheelchair users</li>
            </ol>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ServicesPage;
