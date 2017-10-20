import { DevdayEvent, Address, AgendaEntry, AgendaEntryType } from './../definitions';

export const BANGALORE_ADDRESS: Address = {
      line_one: '#365, 3rd Floor, Sulochana Building',
      line_two: '1st Cross Road, 3rd Block, Sarjapura Main Road',
      locality: 'Koramangala',
      city: 'Bangalore',
      zip: 560034,
      map_link: 'https://goo.gl/maps/ziSASk4tmvM2',
      map_image: '/images/locations/bangalore-map-small.jpg'
    };
export const CHENNAI_ADDRESS: Address = {
      line_one: 'Sahaj Software Solutions Pvt. Ltd.',
      line_two: 'Type 2/15, Dr.V.S.I Estate, Rajiv Gandhi Salai',
      locality: 'Thiruvanmiyur',
      city: 'Chennai',
      zip: 600041,
      map_link: 'https://goo.gl/maps/7Z8iBAdjT1o',
      map_image: '/images/locations/chennai-map-small.jpg'
    };

export const events: DevdayEvent[] = [
  {
    title: 'Data science: How it helps',
    url: 'data-science-how-it-helps',
    categories: ['events'],
    tags: ['data-science'],
    author: 'devday_team',
    abstract: 'On this 3 Edition of DevDay, we have Viral B. Shah, co-inventor of JuliaLang, and other speakers from Sahaj, to share their  experiences and learnings on Data Science.',
    event_time: {
      start_time: new Date('2016-05-07T10:30:00+05:30'),
      end_time: new Date('2016-05-07T13:30:00+05:30'),
    },
    publish_time: new Date('2016-05-07T10:30:00+05:30'),
    registration_time: {
      start_time: new Date('2016-05-07T10:30:00+05:30'),
      end_time: new Date('2016-05-07T13:30:00+05:30')
    },
    venue: BANGALORE_ADDRESS,
    agenda: [
      {
        type: AgendaEntryType.Talk,
        title: 'Julia - A fresh approach to data science and technical computing',
        abstract: '',
        authors: [
          {
            name: "Viral B. Shah",
            image_url: 'images/speakers/viral-shah.jpg'
          }
        ],
        time: {
          start_time: new Date('2016-05-07T10:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Break,
        time: {
          start_time: new Date('2016-04-02T11:15:00+05:30')
        },
        title: 'Tea Break'
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Applied data science for developers',
        abstract: '',
        authors: [
          {
            name: 'Dileep Bapat',
            linkedin_profile_url: 'https://www.linkedin.com/in/dileepbapat/',
            image_url: 'images/speakers/dileep.jpg'
          }
        ],
        time: {
          start_time: new Date('2016-05-07T11:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Break,
        time: {
          start_time: new Date('2016-05-07T13:00:00+05:30')
        },
        title: 'Lunch Break'
      } as AgendaEntry
    ],
    image_url: 'images/events/data-science.jpeg'
  },
  {
    title: 'All about databases',
    url: 'all-about-databases',
    categories: ['events'],
    tags: ['databases','sqlite','event streams'],
    author: 'devday_team',
    abstract: 'A Date with Databases. This meet up would be all about Databases - the internals and the overall. The idea is to tear down databases, across relational/non relational, and understand them deep down.',
    event_time: {
      start_time: new Date('2016-06-04T10:30:00+05:30'),
      end_time: new Date('2016-06-04T13:30:00+05:30'),
    },
    publish_time: new Date('2016-06-04T10:30:00+05:30'),
    registration_time: {
      start_time: new Date('2016-06-04T10:30:00+05:30'),
      end_time: new Date('2016-06-04T10:30:00+05:30')
    },
    venue: BANGALORE_ADDRESS,
    agenda: [
      {
        type: AgendaEntryType.Talk,
        title: 'Databases: Days of the future past',
        abstract: '',
        authors: [
          {
            name: "Avinash Nijampure"
          }
        ],
        time: {
          start_time: new Date('2016-06-04T10:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Break,
        time: {
          start_time: new Date('2016-06-04T11:15:00+05:30')
        },
        title: 'Tea and snacks'
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'SQLite: Why aren\'t you using it more?',
        abstract: '',
        authors: [
          {
            name: 'Srimathi Harinarayanan',
            linkedin_profile_url: 'https://www.linkedin.com/in/shrimats/',
            image_url: 'images/speakers/srimathi.jpg'
          },
          {
            name: 'Navaneeth KN',
            image_url: 'images/speakers/navneeth.jpg'
          }
        ],
        time: {
          start_time: new Date('2016-06-04T11:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Databases as event streams',
        abstract: '',
        authors: [
          {
            name: 'Shashank Teotia',
            linkedin_profile_url: 'https://www.linkedin.com/in/shashank-teotia-8a9b946/',
            image_url: 'images/speakers/shashank-teotia.jpg'
          }
        ],
        time: {
          start_time: new Date('2016-06-04T12:15:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Break,
        time: {
          start_time: new Date('2016-06-04T13:00:00+05:30')
        },
        title: 'Lunch'
      } as AgendaEntry
    ],
    image_url: 'images/events/data-everywhere.jpeg'
  },
  {
    title: 'Arduino Day',
    url: 'arduino-day',
    categories: ['events'],
    tags: ['arduino-genuino-iot'],
    author: 'devday_team',
    abstract: 'Arduino Day is a worldwide birthday celebration of Arduino and Genuino. It\'s a one day event –organized directly by the community, or by the Arduino founders– where people interested in Arduino and Genuino get together, share their experiences, and learn more.',
    event_time: {
      start_time: new Date('2016-04-02T10:30:00+05:30'),
      end_time: new Date('2016-04-02T14:30:00+05:30'),
    },
    publish_time: new Date('2016-04-02T10:30:00+05:30'),
    registration_time: {
      start_time: new Date('2016-04-02T10:30:00+05:30'),
      end_time: new Date('2016-04-02T10:30:00+05:30')
    },
    venue: BANGALORE_ADDRESS,
    agenda: [
      {
        type: AgendaEntryType.Talk,
        title: 'Adventures with Arduino',
        abstract: '',
        authors: [
          {
            name: "Himesh Reddivari",
            image_url: 'images/speakers/himesh-reddivari.jpg'
          }
        ],
        time: {
          start_time: new Date('2016-04-02T10:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Break,
        time: {
          start_time: new Date('2016-04-02T11:15:00+05:30')
        },
        title: 'Tea Break'
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Journey of Samvid',
        abstract: '',
        authors: [
          {
            name: 'Shashank Teotia',
            linkedin_profile_url: 'https://www.linkedin.com/in/shashank-teotia-8a9b946/',
            image_url: 'images/speakers/shashank-teotia.jpg'
          }
        ],
        time: {
          start_time: new Date('2016-04-02T11:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Simple obstacle avoiding Robot using Arduino',
        abstract: '',
        authors: [
          {
            name: 'Deepak Nararyana Rao',
            linkedin_profile_url: 'https://www.linkedin.com/in/endeepak/',
            image_url: 'images/speakers/deepak.jpg'
          }
        ],
        time: {
          start_time: new Date('2016-04-02T12:15:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Workshop,
        title: 'Workshop on Arduino',
        abstract: '',
        authors: [
          {
            name: 'Dileep Bapat',
            linkedin_profile_url: 'https://www.linkedin.com/in/dileepbapat/',
            image_url: 'images/speakers/dileep.jpg'
          }
        ],
        time: {
          start_time: new Date('2016-04-02T13:00:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Break,
        time: {
          start_time: new Date('2016-06-04T13:45:00+05:30')
        },
        title: 'Lunch Break'
      } as AgendaEntry
    ],
    image_url: 'images/events/arduino-day.jpeg'
  },
  {
    title: 'DevDay',
    url: 'first-devday',
    categories: ['events'],
    tags: ['devday', 'Neo4j', 'patttern to scale mobile', 'IOT'],
    author: 'devday_team',
    abstract: 'DevDay is a monthly informal event for developers to share their experiences, ideas, opinions & perspectives about technology',
    event_time: {
      start_time: new Date('2016-03-05T10:30:00+05:30'),
      end_time: new Date('2016-03-03T13:00:00+05:30'),
    },
    publish_time: new Date('2016-02-27T10:30:00+05:30'),
    registration_time: {
      start_time: new Date('2016-02-27T10:30:00+05:30'),
      end_time: new Date('2016-03-05T10:00:00+05:30')
    },
    venue: BANGALORE_ADDRESS,
    agenda: [
      {
        type: AgendaEntryType.Talk,
        title: 'Neo4j - Graph Database',
        abstract: '',
        authors: [
          {
            name: 'Mahesh Lal',
            image_url: 'images/speakers/mahesh-lal.png'
          }
        ],
        time: {
          start_time: new Date('2016-03-05T10:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Break,
        time: {
          start_time: new Date('2016-03-05T11:30:00+05:30')
        },
        title: 'Tea Break'
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Patterns to Scale Mobile Developmen',
        abstract: '',
        authors: [
          {
            name: "Priyank Gupta",
            linkedin_profile_url: 'https://www.linkedin.com/in/priyaaank/',
            image_url: 'images/speakers/priyank.png'
          }
        ],
        time: {
          start_time: new Date('2016-03-05T11:45:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'IOT (Lightning Talk)',
        abstract: '',
        authors: [
          {
            name: 'Dileep Bapat',
            linkedin_profile_url: 'https://www.linkedin.com/in/dileepbapat/',
            image_url: 'images/speakers/dileep.jpg'
          }
        ],
        time: {
          start_time: new Date('2016-03-05T12:45:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'IOT (Lightning Talk)',
        abstract: '',
        authors: [
          {
            name: 'Mahesh B R',
            linkedin_profile_url: 'https://www.linkedin.com/in/raghavendrra-mahesh-0011a610/',
            image_url: 'images/speakers/mahesh.png'
          }
        ],
        time: {
          start_time: new Date('2016-03-05T13:00:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Break,
        time: {
          start_time: new Date('2016-03-05T13:15:00+05:30')
        },
        title: 'Lunch Break'
      } as AgendaEntry
    ],
    image_url: 'images/events/devday.jpg'
  },
  {
    title: 'DevOps in Cloud',
    url: 'devops-in-cloud',
    categories: ['events'],
    tags: ['cloud computing','cloud', 'devops'],
    author: 'devday_team',
    abstract: 'Upload. Download. Dock. Serve. Functions on demand. Everything to do with the cloud.',
    event_time: {
      start_time: new Date('2016-07-16T10:30:00+05:30'),
      end_time: new Date('2016-07-16T13:30:00+05:30'),
    },
    publish_time: new Date('2016-07-08T10:30:00+05:30'),
    registration_time: {
      start_time: new Date('2016-07-08T10:30:00+05:30'),
      end_time: new Date('2016-07-16T10:15:00+05:30')
    },
    venue: BANGALORE_ADDRESS,
    agenda: [
      {
        type: AgendaEntryType.Talk,
        title: 'Product For Blue - Green Deployments Verification',
        abstract: '',
        authors: [
          {
            name: "Srikanth Seshadri",
            linkedin_profile_url: 'https://www.linkedin.com/in/srikanth-seshadri-3402794/',
            image_url: 'images/speakers/srikanth.png'
          }
        ],
        time: {
          start_time: new Date('2016-07-09T10:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Break,
        time: {
          start_time: new Date('2016-07-09T11:15:00+05:30')
        },
        title: 'Tea and snacks'
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Misconceptions of cloud: Automation!',
        abstract: '',
        authors: [
          {
            name: 'Arther Antony',
            linkedin_profile_url: 'https://www.linkedin.com/in/artherantony/',
            image_url: 'images/speakers/arther.png'
          }
        ],
        time: {
          start_time: new Date('2016-07-09T11:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Introduction to DevOps, the pain-points and the frameworks',
        abstract: '',
        authors: [
          {
            name: 'Raghavendrra Mahesh',
            linkedin_profile_url: 'https://www.linkedin.com/in/raghavendrra-mahesh-0011a610/',
            image_url: 'images/speakers/mahesh.png'
          }
        ],
        time: {
          start_time: new Date('2016-07-09T12:15:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Break,
        time: {
          start_time: new Date('2016-07-09T13:00:00+05:30')
        },
        title: 'Lunch Break'
      } as AgendaEntry
    ],
    color: 'black',
    image_url: 'images/events/cloud_computing.jpg'
  },
  {
    title: 'JS Everywhere',
    url: 'js-everywhere',
    categories: ['events'],
    tags: ['js','javascript', 'react-native', 'cycle-js'],
    author: 'devday_team',
    abstract: 'Desktop or offline applications? We\'ve got you covered. Reactive applications? Try cycle. Native moblie applications? We have React Native. Internet of Things? Johnny Five\'s here to help. JavaScript has evolved into one of the easiest and ubiquitous language around, and it looks like there isn\'t much that can\'t be done with it. JS Everywhere - Let\'s rejoice!',
    event_time: {
      start_time: new Date('2016-08-04T18:30:00+05:30'),
      end_time: new Date('2016-08-04T20:30:00+05:30'),
    },
    publish_time: new Date('2016-08-04T18:30:00+05:30'),
    registration_time: {
      start_time: new Date('2016-08-04T18:30:00+05:30'),
      end_time: new Date('2016-08-04T18:30:00+05:30')
    },
    venue: CHENNAI_ADDRESS,
    agenda: [
      {
        type: AgendaEntryType.Talk,
        title: 'Creating offline/desktop applications using Electron',
        abstract: '',
        authors: [
          {
            name: 'Sairam Krishnamurthy',
            linkedin_profile_url: 'https://www.linkedin.com/in/sairamkrish/',
            image_url: 'images/speakers/sairam.jpg'
          }
        ],
        time: {
          start_time: new Date('2016-08-04T18:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Building native mobile applications using React Native',
        abstract: '',
        authors: [
          {
            name: 'Vagmi Mudumbai',
            linkedin_profile_url: 'https://www.linkedin.com/in/vagmi/',
            image_url: 'images/speakers/vagmi.jpg'
          }
        ],
        time: {
          start_time: new Date('2016-08-04T19:00:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Functional Reactive Programming with Cycle.js',
        abstract: '',
        authors: [
          {
            name: 'Sudarsan Balaji',
            linkedin_profile_url: 'https://www.linkedin.com/in/sudarsanbalaji/',
            image_url: 'images/speakers/sudarsan.png'
          }
        ],
        time: {
          start_time: new Date('2016-08-04T19:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Writing for IoT using Johnny-Five',
        abstract: '',
        authors: [
          {
            name: 'Raj Bharath Kannan',
            linkedin_profile_url: 'https://www.linkedin.com/in/rajbharath/',
            image_url: 'images/speakers/raj.png'
          }
        ],
        time: {
          start_time: new Date('2016-04-02T13:00:00+05:30')
        }
      } as AgendaEntry
    ],
    color: '#f7df1e',
    image_url: 'images/events/js_everywhere.png',
    meetup_urlname: 'devday_chennai',
    meetup_event_id: '232886624'
  },
  {
    title: 'Functional programming: Hands on Elixir',
    url: 'hands-on-elixir',
    categories: ['events'],
    tags: ['elixir','functional programming', 'concurrent programming'],
    author: 'devday_team',
    abstract: 'We bring to you Elixir - a concurrent, functional programming language.',
    event_time: {
      start_time: new Date('2016-08-27T10:30:00+05:30'),
      end_time: new Date('2016-08-28T13:30:00+05:30'),
    },
    publish_time: new Date('2016-07-09T10:30:00+05:30'),
    registration_time: {
      start_time: new Date('2016-08-27T10:30:00+05:30'),
      end_time: new Date('2016-08-28T13:30:00+05:30'),
    },
    venue: BANGALORE_ADDRESS,
    agenda: [
      {
        type: AgendaEntryType.Workshop,
        title: 'Hands-On with Elixir',
        abstract: '',
        authors: [
          {
            name: "Navaneeth N",
            image_url: 'images/speakers/navneeth.jpg'
          }
        ],
        time: {
          start_time: new Date('2016-08-27T10:30:00+05:30')
        }
      } as AgendaEntry
    ],
    color: '#211b33',
    image_url: 'images/events/programming.jpg',
    meetup_urlname: 'devday_bangalore',
    meetup_event_id: '233530425'
  },
  {
    title: 'This time it\'s real-time',
    url: 'its-real-time',
    categories: ['events'],
    tags: ['real-time','rtc', 'webrtc', 'peer-js'],
    author: 'devday_team',
    abstract: 'In this edition of Dev Day (Chennai) we have talks scheduled on RTC. Come learn about aspects of real time communication and the way real time systems are built.',
    event_time: {
      start_time: new Date('2016-09-10T10:00:00+05:30'),
      end_time: new Date('2016-09-10T13:00:00+05:30'),
    },
    publish_time: new Date('2016-08-04T18:30:00+05:30'),
    registration_time: {
      start_time: new Date('2016-09-10T10:00:00+05:30'),
      end_time: new Date('2016-09-10T13:00:00+05:30'),
    },
    venue: CHENNAI_ADDRESS,
    agenda: [
      {
        type: AgendaEntryType.Talk,
        title: 'Realtime Chat using Socket.io on Production',
        abstract: 'The web has typically been a client request server protocol from the beginning of time. Websockets are starting to change that with a bi-directional data flow. This talk will explore how socket.io, a framework for websockets was used to develop a chat application that was on production.',
        authors: [
          {
            name: 'Arvind Sridharan',
            linkedin_profile_url: 'https://www.linkedin.com/in/arvsr1988/',
            image_url: 'images/speakers/arvind.jpg'
          }
        ],
        time: {
          start_time: new Date('2016-08-04T10:00:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Real Time Communication, Fast and Slow',
        abstract: 'Browsers and servers have always constituted a distributed system, and with the rise of (micro?)services, servers have now become distributed systems too. The fundamental need of any of these systems is to communicate effectively - we\'ll look at the various options and methods of doing just that.',
        authors: [
          {
            name: 'Sudhir Jonathan',
            linkedin_profile_url: 'https://www.linkedin.com/in/sudhir-jonathan-5b4610b/',
            image_url: 'images/speakers/sudhir.png'
          }
        ],
        time: {
          start_time: new Date('2016-08-04T11:00:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Getting started with WebRTC',
        abstract: 'WebRTC is a framework for the web that enables Real Time Communication in the browser. Get to know about WebRTC technology & also learn how to build a webrtc application.',
        authors: [
          {
            name: 'Vijayakumar Nagarajan',
            linkedin_profile_url: 'https://www.linkedin.com/in/vijayakumarnagarajan/',
            image_url: 'images/speakers/vijayakumar.png'
          }
        ],
        time: {
          start_time: new Date('2016-08-04T12:00:00+05:30')
        }
      } as AgendaEntry,
    ],
    color: '#040509',
    image_url: 'images/events/fast.jpeg',
    meetup_urlname: 'devday_chennai',
    meetup_event_id: '232886624',
    form: {
      url: 'https://docs.google.com/forms/d/e/1FAIpQLSd7wUzgQ7VuP3z41GtnTemaxFzv-4K10TuBHjCZqjcI8xxDJA/formResponse',
      name: 'entry.2092238618',
      email: 'entry.1556369182',
      mobile: 'entry.479301265',
      type: 'entry.630971362',
      title: 'entry.1832696420',
      abstract: 'entry.354689399'
    }
  },
  {
    title: 'Math For Machine Learning',
    url: 'math-for-machine-learning',
    categories: ['Machine Learning'],
    tags: ['Machine Learning','Math', 'Data Science'],
    author: 'devday_team',
    abstract: 'Learn about the basic math and algorithms required for machine learning',
    event_time: {
      start_time: new Date('2016-11-19T10:30:00+05:30'),
      end_time: new Date('2016-11-19T10:00:00+05:30')
    },
    publish_time: new Date('2016-11-11T23:45:00+05:30'),
    registration_time: {
      start_time: new Date('2016-11-11T23:45:00+05:30'),
      end_time: new Date('2016-11-19T09:45:00+05:30'),
    },
    venue: BANGALORE_ADDRESS,
    agenda: [
       {
        type: AgendaEntryType.Talk,
        title: 'Basic concepts of statistics and introduction to ML',
        abstract: 'Get started with basic statistics and see them in action with real-time datasets. Discuss the basic definitions of machine learning and also about when and when not to use ML. We will be using Python notebook to demonstrate the concepts.',
        authors: [
          {
            name: 'Deepthi Chand',
            linkedin_profile_url: 'https://www.linkedin.com/in/deepthi-chand-alagandula-5415862b/',
            image_url: '/images/speakers/deepthi.png'
          }
        ],
        time: {
          start_time: new Date('2016-11-19T10:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Diving into machine learning with simple maths and statistics',
        abstract: "Ever felt intimidated by the nuances and world of machine learning? Come and hear someone reason about it using rudimentary maths and concepts like Euclidean distance and Pearson's correlation score to build a super simple recommendation engine and unsupervised clusters of data. Understand how linear regression allows for predictive capabilities on datasets. Look at how to build simple classifiers using python libraries without understanding the guts of machine learning. This talk uses python for the code. Classifiers are built using the nltk library with Python.",
        authors: [
          {
            name: 'Priyank Gupta',
            linkedin_profile_url: 'https://www.linkedin.com/in/priyaaank/',
            image_url: '/images/speakers/priyank.png'
          }
        ],
        time: {
          start_time: new Date('2016-11-19T11:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Introduction to Linear Regression',
        abstract: '',
        authors: [
          {
            name: 'Shashank Teotia',
            linkedin_profile_url: 'https://www.linkedin.com/in/shashank-teotia-8a9b946/',
            image_url: '/images/speakers/shashank-teotia.jpg'
          }
        ],
        time: {
          start_time: new Date('2016-11-19T12:30:00+05:30')
        }
      } as AgendaEntry,
    ],
    color: '#211b33',
    meetup_urlname: 'devday_bangalore',
    meetup_event_id: '235590887',
    form: {
      spreadsheetId : '1xR-opuZ3sIEvjktfzpkuC60J3gJNlRExMYP74Ym4zwo',
      sheetName : 'Form Responses 1'
    },
    image_url: '/images/events/math.jpeg',
  },
  {
    title: 'DevOps for Devs',
    url: 'devops-for-devs',
    categories: ['events'],
    tags: ['devops'],
    author: 'devday_team',
    abstract: 'In this edition of the Dev Day, we are presenting talks on Devops - "DevOps for Devs". Come join us to understand why "DevOps" is relevant today from a technology standpoint',
    event_time: {
      start_time: new Date('2016-10-13T18:30:00+05:30'),
      end_time: new Date('2016-10-13T20:30:00+05:30'),
    },
    publish_time: new Date('2016-08-04T18:30:00+05:30'),
    registration_time: {
      start_time: new Date('2016-09-10T10:00:00+05:30'),
      end_time: new Date('2016-10-13T18:30:00+05:30'),
    },
    venue: CHENNAI_ADDRESS,
    agenda: [
      {
        type: AgendaEntryType.Talk,
        title: 'DevOps 101',
        abstract: '',
        authors: [
          {
            name: 'Srimathi Harinarayanan',
            linkedin_profile_url: 'https://www.linkedin.com/in/shrimats/',
            image_url: 'images/speakers/srimathi.jpg'
          }
        ],
        time: {
          start_time: new Date('2016-08-13T18:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Ephemeral Infrastructure',
        abstract: '',
        authors: [
          {
            name: 'Mahesh and Arther',
            linkedin_profile_url: 'https://www.linkedin.com/in/artherantony/',
            image_url: 'images/speakers/arther.png'
          }
        ],
        time: {
          start_time: new Date('2016-08-13T18:45:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Kubernetes in Production',
        abstract: 'In this talk, Manoj will be talking about the Kubernetes setup at Indix which has been running for the last 10 months now. He will be going into the details of bringing up and managing a Kubernetes cluster and the features of Kubernetes that they use at Indix.',
        authors: [
          {
            name: 'Manoj Mahalingam',
            linkedin_profile_url: 'https://www.linkedin.com/in/manojlds/',
            image_url: '/images/speakers/manoj.jpg'
          }
        ],
        time: {
          start_time: new Date('2016-08-13T19:30:00+05:30')
        }
      } as AgendaEntry,
    ],
    color: '#040509',
    image_url: '/images/events/for-devs.jpeg',
    meetup_urlname: 'devday_chennai',
    meetup_event_id: '234495890',
    form: {
      spreadsheetId : '1dySpYU4nW8mxVxkt8Zzju72HpuE_5DBdzU-RvwOVu18',
      sheetName : 'Form Responses 1'
    }
  },
  {
    title: 'Hack Hack and just Hack!',
    url: 'hack-and-just-hack',
    categories: ['Hackathon'],
    tags: ['IOT', 'Machine Learning', 'Data Science'],
    author: 'devday_team',
    abstract: "This time let's just code to make amazing products. Software/hardware and all things awesome.",
    event_time: {
      start_time: new Date('2016-10-15T10:00:00+05:30'),
      end_time: new Date('2016-10-15T17:30:00+05:30')
    },
    publish_time: new Date('2016-10-07T23:45:00+05:30'),
    registration_time: {
      start_time: new Date('2016-10-07T23:45:00+05:30'),
      end_time: new Date('2016-10-15T09:45:00+05:30'),
    },
    venue: BANGALORE_ADDRESS,
    agenda: [
       {
        type: AgendaEntryType.Talk,
        title: 'Hack Hack and just Hack!',
        abstract: 'Problem Statements:-\n\r 1. Design and develop a device/wearable that has the capability to detect the direction and intensity of sound (the required hardware would be provided at the venue). \n\r 2. Classification of certain datasets using machine learning algorithms (Dataset would be provided). \n\r 3. Device a solution to predict an indoor location of a entity (hardware would be provided).',
        time: {
          start_time: new Date('2016-10-15T10:00:00+05:30')
        }
      } as AgendaEntry
    ],
    color: '#211b33',
    meetup_urlname: 'devday_bangalore',
    meetup_event_id: '235590887',
    form: {
      spreadsheetId : '1xR-opuZ3sIEvjktfzpkuC60J3gJNlRExMYP74Ym4zwo',
      sheetName : 'Form Responses 1'
    },
    image_url: '/images/events/hack.jpeg',
  },
  {
    title: 'Cross Platform Mobile Apps',
    url: 'cross-platform-mobile-apps-handson',
    categories: ['events'],
    tags: ['cross platform','mobile apps','handson'],
    author: 'devday_team',
    abstract: 'Participants will form teams and pick a technology of their interest (i.e. Xamarin, Cordova, React Native) to build a cross platform mobile app. The app to be built is a todo list where users can add todo items with a photo and a location. The problem has been designed so that it can be built within a few hours.',
    event_time: {
      start_time: new Date('2016-11-19T10:00:00+05:30'),
      end_time: new Date('2016-11-19T15:00:00+05:30'),
    },
    publish_time: new Date('2016-08-04T18:30:00+05:30'),
    registration_time: {
      start_time: new Date('2016-09-10T10:00:00+05:30'),
      end_time: new Date('2016-11-19T10:00:00+05:30'),
    },
    venue: CHENNAI_ADDRESS,
    agenda: [
      {
        type: AgendaEntryType.Workshop,
        title: 'Introduction',
        abstract: 'A brief introduction to the event format along with a detailed explanation of the problem.',
        time: {
          start_time: new Date('2016-11-19T10:00:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Workshop,
        title: 'Team Formation',
        abstract: 'Participants will form teams based on their interest.',
        time: {
          start_time: new Date('2016-11-19T10:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Workshop,
        title: 'Get cracking with the code',
        abstract: 'Teams can organise their own lunch breaks during the coding time. Lunch will be provided by Sahaj.',
        time: {
          start_time: new Date('2016-11-19T10:45:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Workshop,
        title: 'Showcase and discussion',
        abstract: 'All the apps built will be showcased. This will be followed by a discussion on pros and cons of the technologies they the individual teams would have used to solve the problem.',
        time: {
          start_time: new Date('2016-11-19T14:00:00+05:30')
        }
      } as AgendaEntry,
    ],
    color: '#040509',
    image_url: 'images/events/devices.jpeg',
    meetup_urlname: 'devday_chennai',
    meetup_event_id: '235318558',
    form: {
      spreadsheetId : '1dySpYU4nW8mxVxkt8Zzju72HpuE_5DBdzU-RvwOVu18',
      sheetName : 'Form Responses 1'
    }
  },
  {
    title: 'Coding a Tic Tac Toe Game',
    url: 'game-programming-101',
    categories: ['events'],
    tags: ['tic tac toe', 'game Programming 101'],
    author: 'devday_team',
    abstract: 'Ever thought playing tic-tac-toe was easy? Let’s learn to build a tic-tac-toe program that can beat us every time – on a grid of any size, not just 3x3. We will be learning about modelling a game, writing an evaluation function, and searching for the optimal move. What’s more, all that we learn can be used to program for chess! ',
    event_time: {
      start_time: new Date('2017-01-19T18:30:00+05:30'),
      end_time: new Date('2017-01-19T20:30:00+05:30'),
    },
    publish_time: new Date('2017-01-02T18:30:00+05:30'),
    registration_time: {
      start_time: new Date('2017-01-02T18:30:00+05:30'),
      end_time: new Date('2017-01-19T18:30:00+05:30'),
    },
    venue: CHENNAI_ADDRESS,
    agenda: [
      {
        type: AgendaEntryType.Talk,
        title: 'Writing a tic-tac-toe program that can beat you every time',
        abstract: '',
        authors: [
          {
            name: 'Sudarsan Balaji',
            linkedin_profile_url: 'https://www.linkedin.com/in/sudarsanbalaji/',
            image_url: 'images/speakers/sudarsan.png'
          }
        ],
        time: {
          start_time: new Date('2017-01-19T18:00:00+05:30')
        }
      } as AgendaEntry,
    ],
    color: '#040509',
    image_url: 'images/events/tic-tac-toe.jpeg',
    meetup_urlname: 'devday_chennai',
    meetup_event_id: '236605725',
    form: {
      spreadsheetId : '1dySpYU4nW8mxVxkt8Zzju72HpuE_5DBdzU-RvwOVu18',
      sheetName : 'Form Responses 1'
    }
  },
  {
    title: 'First Dive into Deep Learning',
    url: 'first-dive-deep-learning',
    categories: ['events'],
    tags: ['deep learning', 'data science'],
    author: 'devday_team',
    abstract: 'This time lets discuss basic concepts of Deep Learning and gets our hands dirty by solving a problem using the very basics we discussed.',
    event_time: {
      start_time: new Date('2016-12-10T11:00:00+05:30'),
      end_time: new Date('2016-12-10T16:00:00+05:30'),
    },
    publish_time: new Date('2016-12-02T18:30:00+05:30'),
    registration_time: {
      start_time: new Date('2016-12-02T10:30:00+05:30'),
      end_time: new Date('2016-12-10T18:30:00+05:30'),
    },
    venue: BANGALORE_ADDRESS,
    agenda: [
       {
        type: AgendaEntryType.Talk,
        title: 'Introduction to Deep learning ',
        abstract: '',
        authors: [
        ],
        time: {
          start_time: new Date('2016-12-10T11:00:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Basic concepts of Deep Learning',
        abstract: '',
        authors: [
        ],
        time: {
          start_time: new Date('2016-12-10T12:00:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Break,
        time: {
          start_time: new Date('2016-02-10T13:00:00+05:30')
        },
        title: 'Lunch and Networking'
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Hands - on Deep Learning',
        abstract: '',
        authors: [
        ],
        time: {
          start_time: new Date('2016-12-10T14:00:00+05:30')
        }
      } as AgendaEntry
    ],
    color: '#211b33',
    meetup_urlname: 'devday_bangalore',
    meetup_event_id: '235960569',
    form: {
      spreadsheetId : '1xR-opuZ3sIEvjktfzpkuC60J3gJNlRExMYP74Ym4zwo',
      sheetName : 'Form Responses 1'
    },
    image_url: 'images/events/connections.jpeg',
  },
  {
    title: 'Know NoSQL',
    url: 'know-nosql',
    categories: ['events'],
    tags: ['NoSQL', 'CouchDB'],
    author: 'devday_team',
    abstract: 'In this edition of DevDay we will start with an introduction to NoSQL and the various types of NoSQL stores followed by a talk on how CouchDB was used in production',
    event_time: {
      start_time: new Date('2017-02-16T18:30:00+05:30'),
      end_time: new Date('2017-02-16T20:30:00+05:30'),
    },
    publish_time: new Date('2017-01-02T18:30:00+05:30'),
    registration_time: {
      start_time: new Date('2017-01-02T18:30:00+05:30'),
      end_time: new Date('2017-02-16T18:30:00+05:30'),
    },
    venue: CHENNAI_ADDRESS,
    agenda: [
      {
        type: AgendaEntryType.Talk,
        title: 'NoSQL 101',
        abstract: 'We start the devday by exploring different types of NoSQL databases and discuss scenarios where each type of NoSQL store are typically used.',
        authors: [
          {
            name: 'Ramanathan',
            linkedin_profile_url: 'https://www.linkedin.com/in/ramanathan-balakrishnan-a9594217/',
            image_url: '/images/speakers/ramanathan.jpg'
          }
        ],
        time: {
          start_time: new Date('2017-01-19T18:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'A deep dive into CouchDB',
        video: 'https://www.youtube.com/watch?v=Lz9TSFU8ZTg&t=258s',
        abstract: 'In this talk we will discuss how various features of CouchDB (i.e. MapReduce, indices, sorting) were used in production in context of the CAP theorem.',
        authors: [
          {
            name: 'Raj Bharath Kannan',
            linkedin_profile_url: 'https://www.linkedin.com/in/rajbharath/',
            image_url: '/images/speakers/raj.png'
          }
        ],
        time: {
          start_time: new Date('2017-01-19T19:30:00+05:30')
        }
      } as AgendaEntry,
    ],
    color: '#040509',
    image_url: 'images/events/learn.jpeg',
    meetup_urlname: 'devday_chennai',
    meetup_event_id: '237520259',
    form: {
      spreadsheetId : '1dySpYU4nW8mxVxkt8Zzju72HpuE_5DBdzU-RvwOVu18',
      sheetName : 'Form Responses 1'
    }
  },
  {
    title: 'Microservice Architectures - How To?',
    url: 'microservice-architectue',
    categories: ['events'],
    tags: ['microservice', 'distributed', 'microservice architecture'],
    author: 'devday_team',
    abstract: 'This time we are talking about the implementation of Microservice Architectures. Scaling, distribution, inter service communication and so on..',
    event_time: {
      start_time: new Date('2017-02-16T17:30:00+05:30'),
      end_time: new Date('2017-02-16T19:30:00+05:30'),
    },
    publish_time: new Date('2017-02-09T18:30:00+05:30'),
    registration_time: {
      start_time: new Date('2017-02-09T18:30:00+05:30'),
      end_time: new Date('2017-02-16T17:30:00+05:30'),
    },
    venue: BANGALORE_ADDRESS,
    agenda: [
      {
        type: AgendaEntryType.Talk,
        title: 'Microservices - Check List',
        abstract: 'Kickoff with nuts and bolts needed for implementing microservice.',
        authors: [
          {
            name: 'Navaneeth K N',
            image_url: '/images/speakers/navneeth.jpg'
          }
        ],
        time: {
          start_time: new Date('2017-01-19T17:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Monolith to Microservice - A case study.',
        abstract: 'This session takes you to a case study about trasnforming a giant monolith application to a distributed microservice application.',
        authors: [
          {
            name: 'Thirunavukkarasu',
            image_url: '/images/speakers/thiru.jpg'
          }
        ],
        time: {
          start_time: new Date('2017-01-19T18:30:00+05:30')
        }
      } as AgendaEntry,
    ],
    color: '#040509',
    image_url: '/images/events/question.jpeg',
    meetup_urlname: 'devday_bangalore',
    meetup_event_id: '237578088',
    form: {
      spreadsheetId : '1dySpYU4nW8mxVxkt8Zzju72HpuE_5DBdzU-RvwOVu18',
      sheetName : 'Form Responses 1'
    }
  },
  {
    title: 'Architecture',
    url: 'architecture',
    categories: ['events'],
    tags: ['Architecture', 'load', 'microservices'],
    author: 'devday_team',
    abstract: 'We start this DevDay by exploring a case study on managing a high load system followed by a discussion on microservices',
    event_time: {
      start_time: new Date('2017-03-16T18:30:00+05:30'),
      end_time: new Date('2017-03-16T20:30:00+05:30'),
    },
    publish_time: new Date('2017-03-02T18:30:00+05:30'),
    registration_time: {
      start_time: new Date('2017-03-02T18:30:00+05:30'),
      end_time: new Date('2017-03-16T18:30:00+05:30'),
    },
    venue: CHENNAI_ADDRESS,
    agenda: [
      {
        type: AgendaEntryType.Talk,
        title: 'Experience with high load system design',
        abstract: 'I had an opportunity to design and implement a system to monitor the activity of a performant cloud deployment solution. The talk is about my experience in design and architecture of such a system; the trade offs made; things that failed to work etc.',
        authors: [
          {
            name: 'Srikanth Seshadri',
            linkedin_profile_url: 'https://www.linkedin.com/in/srikanth-seshadri-3402794/',
            image_url: '/images/speakers/srikanth.png'
          }
        ],
        time: {
          start_time: new Date('2017-01-19T18:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Microservices - what, why and how?',
        abstract: 'In this talk we will explore what microservices is, why you should or should not move to a microservice architecture as well as discuss some best practices',
        authors: [
          {
            name: 'Arvind Sridharan',
            linkedin_profile_url: 'https://www.linkedin.com/in/arvsr1988/',
            image_url: '/images/speakers/arvind.jpg'
          }
        ],
        time: {
          start_time: new Date('2017-01-19T19:30:00+05:30')
        }
      } as AgendaEntry,
    ],
    color: '#040509',
    image_url: 'images/events/architecture.jpeg',
    meetup_urlname: 'devday_chennai',
    meetup_event_id: '238210259',
    form: {
      spreadsheetId : '1dySpYU4nW8mxVxkt8Zzju72HpuE_5DBdzU-RvwOVu18',
      sheetName : 'Form Responses 1'
    }
  },
  {
    title: 'Distributed Systems and Serverless Architecture',
    url: 'distributed-systems-and-serverless-architecture',
    categories: ['events'],
    tags: ['Architecture', 'load', 'microservices'],
    author: 'devday_team',
    abstract: '',
    event_time: {
      start_time: new Date('2017-04-20T18:30:00+05:30'),
      end_time: new Date('2017-04-20T20:30:00+05:30'),
    },
    publish_time: new Date('2017-03-02T18:30:00+05:30'),
    registration_time: {
      start_time: new Date('2017-03-02T18:30:00+05:30'),
      end_time: new Date('2017-04-20T18:30:00+05:30'),
    },
    venue: CHENNAI_ADDRESS,
    agenda: [
      {
        type: AgendaEntryType.Talk,
        title: 'Serverless Architecture',
        abstract: 'The talk will start with an introduction to serverless architecture and why it is so hot now. From the basics we will explore web jobs, creating and running azure functions and integration of azure functions with logic apps.',
        authors: [
          {
            name: 'Karthikeyan VK, Web Application Architect at CADS Software',
            linkedin_profile_url: 'https://www.linkedin.com/in/karthikeyan-vk-27508254/',
            image_url: 'https://media.licdn.com/mpr/mpr/shrinknp_400_400/AAEAAQAAAAAAAAYQAAAAJDFkZDgyYjk1LTllZjYtNDE3OC1iNzNlLTI2MWNmMTljMDIyZQ.jpg'
          }
        ],
        time: {
          start_time: new Date('2017-01-19T18:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Suuchi - Toolkit for building Distributed Data systems',
        abstract: 'Suuchi is a Scala library that can be used for building distributed data systems. I\'ll be talking about the motivation for building such a library and a simple code walk through at the end on how to build such a simple distributed KV store using Suuchi.',
        authors: [
          {
            name: 'Ashwanth Kumar, Software Engineer at Indix',
            linkedin_profile_url: 'https://www.linkedin.com/in/ashwanthkumar/',
            image_url: '/images/speakers/ashwanth.jpg'
          }
        ],
        time: {
          start_time: new Date('2017-01-19T19:30:00+05:30')
        }
      } as AgendaEntry,
    ],
    color: '#040509',
    image_url: '/images/events/honeycomb.jpg',
    meetup_urlname: 'devday_chennai',
    meetup_event_id: '238855098',
    form: {
      spreadsheetId : '1dySpYU4nW8mxVxkt8Zzju72HpuE_5DBdzU-RvwOVu18',
      sheetName : 'Form Responses 1'
    }
  },
  {
    title: 'Should you "React" js',
    url: 'should-you-react-js',
    categories: ['events'],
    tags: ['react', 'vue', 'mithril', 'javsacript', 'js', 'frontend'],
    author: 'devday_team',
    abstract: 'This DevDay, we start off by talking about various javascript frameworks and how to pick one. We will then drill down to a particular javascript framework as part of the second talk.',
    event_time: {
      start_time: new Date('2017-05-18T18:30:00+05:30'),
      end_time: new Date('2017-05-18T20:30:00+05:30'),
    },
    publish_time: new Date('2017-03-02T18:30:00+05:30'),
    registration_time: {
      start_time: new Date('2017-03-02T18:30:00+05:30'),
      end_time: new Date('2017-05-18T18:30:00+05:30'),
    },
    venue: CHENNAI_ADDRESS,
    agenda: [
      {
        type: AgendaEntryType.Talk,
        title: 'React.js Vue.js Mithril.js - How do you decide?',
        video: 'https://www.youtube.com/watch?v=7Dz__uU1t9o',
        ppt: 'http://sudhakar.online/programming/2017/05/18/react-vue-mithril.html',
        abstract: 'Recently there are lots of JavaScript frameworks to pick from and they are very different from the way they have been designed to solve a same problem. I will compare and explain these design ideas and how they fare based on my project work experience in all these 3 frameworks',
        authors: [
          {
            name: 'Sudhakar, Lead Software Consultant at Tarka Labs',
            linkedin_profile_url: 'https://www.linkedin.com/in/sudhakar82/',
            image_url: 'https://media.licdn.com/mpr/mpr/shrinknp_400_400/p/1/000/1c8/2b3/3aa58e7.jpg'
          }
        ],
        time: {
          start_time: new Date('2017-01-19T18:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Building a Real World React Redux App',
        video: 'https://www.youtube.com/watch?v=1J0jSFahZYU',
        ppt: 'https://www.slideshare.net/secret/kLRzmO5eEzx2Op',
        abstract: 'In this talk I would like to share my experience on working with React.js and redux to build and deploy a front-end application, how to take your basic understanding of react and apply it to building UI components, how you can organise your application\'s data in your redux store and finally how to connect them together to do the magic.',
        authors: [
          {
            name : 'Alfred, Solution Consultant at Sahaj Software',
            linkedin_profile_url: 'https://www.linkedin.com/in/alfredmilan/',
            image_url :'https://media.licdn.com/mpr/mpr/shrinknp_400_400/AAEAAQAAAAAAAAkFAAAAJGY1ZTMwNjU5LWYxZDYtNDU0OS05MWI5LTk4NjdmNjg4N2YyMA.jpg'
          }
        ],
        time: {
          start_time: new Date('2017-01-19T19:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Dinner and networking',
        abstract: '',
        authors: [],
        time: {
          start_time: new Date('2017-01-19T20:30:00+05:30')
        }
      } as AgendaEntry,
    ],
    color: '#040509',
    image_url: '/images/events/question.jpeg',
    meetup_urlname: 'devday_chennai',
    meetup_event_id: '239567301',
    form: {
      spreadsheetId : '1dySpYU4nW8mxVxkt8Zzju72HpuE_5DBdzU-RvwOVu18',
      sheetName : 'Form Responses 1'
    }
  },
  {
    title: 'Functional Programming',
    url: 'functional-programming',
    categories: ['events'],
    tags: ['javsacript', 'js', 'frontend', 'elixir'],
    author: 'devday_team',
    abstract: 'This time we are talking about functional programming with a hands on session.',
    event_time: {
      start_time: new Date('2017-05-06T10:30:00+05:30'),
      end_time: new Date('2017-05-06T13:00:00+05:30'),
    },
    publish_time: new Date('2017-05-02T09:30:00+05:30'),
    registration_time: {
      start_time: new Date('2017-05-02T09:30:00+05:30'),
      end_time: new Date('2017-05-18T13:00:00+05:30'),
    },
    venue: BANGALORE_ADDRESS,
    agenda: [
      {
        type: AgendaEntryType.Talk,
        title: 'Introduction to functional programming',
        abstract: 'Introduction to functional programming using Elixir',
        authors: [
          {
            name: 'Navaneeth, Software Consultant, Sahaj',
            image_url: 'images/speakers/navneeth.jpg'
          }
        ],
        time: {
          start_time: new Date('2017-05-06T10:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Hands-on functional programming',
        abstract: 'Hands-on session on functional programming using Scala',
        authors: [
          {
            name: 'Dileep Bapat, Software Consultant, Sahaj',
            linkedin_profile_url: 'https://www.linkedin.com/in/dileepbapat/',
            image_url: 'images/speakers/dileep.jpg'
          }
        ],
        time: {
          start_time: new Date('2017-05-06T11:30:00+05:30')
        }
      } as AgendaEntry
    ],
    color: '#283593',
    image_url: 'images/events/code.jpeg',
    meetup_urlname: 'devday_bangalore',
    meetup_event_id: '239660651',
    form: {
      spreadsheetId : '1dySpYU4nW8mxVxkt8Zzju72HpuE_5DBdzU-RvwOVu18',
      sheetName : 'Form Responses 1'
    }
  },
  {
    title: 'Data, Data Everywhere!',
    url: 'data-data-everywhere',
    categories: ['events'],
    tags: ['platform', 'data', 'analytics'],
    author: 'devday_team',
    abstract: 'This DevDay we will talk on how to build platforms to leverage data from user interaction followed by a session on how Indix does matching of 1.5+ billion products at scale.',
    event_time: {
      start_time: new Date('2017-06-15T18:30:00+05:30'),
      end_time: new Date('2017-06-15T20:30:00+05:30'),
    },
    publish_time: new Date('2017-03-02T18:30:00+05:30'),
    registration_time: {
      start_time: new Date('2017-06-02T18:30:00+05:30'),
      end_time: new Date('2017-06-15T18:30:00+05:30'),
    },
    venue: CHENNAI_ADDRESS,
    agenda: [
      {
        type: AgendaEntryType.Talk,
        title: 'Make your data talk - Building a data platform services from the ground up',
        abstract: 'Data is the asset which powers any business today. As every business interacts with its users digitally, data about those interactions provide insights that help drive a better engagement with all parties. However, building platforms and products with these data at scale has its own challenges. In this talk, we discuss the motivation, challenges and learnings from building such data platform and services to help the organization connect with users in a better way and provide much more value.',
        authors: [
          {
            name: 'Sanjoy Bose, Solution Consultant at Sahaj Software',
            linkedin_profile_url: 'https://www.linkedin.com/in/sanjoyb/',
            image_url: 'https://media.licdn.com/mpr/mpr/shrinknp_400_400/AAEAAQAAAAAAAAfEAAAAJDIxNWMxOWZhLTEyMjYtNGQ5Yi1hNmUyLThiZDVlYzI2NjkxZg.jpg'
          }
        ],
        time: {
          start_time: new Date('2017-01-19T18:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Matching at Scale',
        abstract: 'We will look at the techniques and technologies that Indix uses (Scalding and Spark, Dedup, buckets and fuzzy matching), to solve the problem of matching 1.5 + billion products with each other at scale.',
        authors: [
          {
            name : "Karthik N and Rajesh KM, Indix",
          }
        ],
        time: {
          start_time: new Date('2017-01-19T19:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Dinner and networking',
        abstract: '',
        authors: [],
        time: {
          start_time: new Date('2017-01-19T20:30:00+05:30')
        }
      } as AgendaEntry,
    ],
    color: '#040509',
    image_url: '/images/events/data-everywhere.jpeg',
    meetup_urlname: 'devday_chennai',
    meetup_event_id: '240478877',
    form: {
      spreadsheetId : '1dySpYU4nW8mxVxkt8Zzju72HpuE_5DBdzU-RvwOVu18',
      sheetName : 'Form Responses 1'
    }
  },
  {
    title: 'Developing Applications that Scale',
    url: 'applications-that-scale',
    categories: ['events'],
    tags: ['scalabel architecture', 'principles', 'patterns', 'app engine'],
    author: 'devday_team',
    abstract: 'The talks would mostly cover the principles and patterns that a developer would need to write scalable applications.',
    event_time: {
      start_time: new Date('2017-06-24T10:00:00+05:30'),
      end_time: new Date('2017-06-24T10:00:00+05:30'),
    },
    publish_time: new Date('2017-06-17T14:00:00+05:30'),
    registration_time: {
      start_time: new Date('2017-06-17T14:00:00+05:30'),
      end_time: new Date('2017-06-24T09:30:00+05:30'),
    },
    venue: BANGALORE_ADDRESS,
    agenda: [
      {
        type: AgendaEntryType.Talk,
        title: 'AppEngine and Scalability',
        abstract: '',
        authors: [
          {
            name: 'Jijesh Mohan',
            linkedin_profile_url: 'https://in.linkedin.com/in/jijesh-mohan-545488a',
            image_url: 'https://media.licdn.com/mpr/mpr/shrinknp_200_200/AAEAAQAAAAAAAAkoAAAAJGM1ZjI3Yjc1LTIxMjQtNDhkMC1hNDg1LWVjMjk5NWZkYTFkZQ.jpg'
          }
        ],
        time: {
          start_time: new Date('2017-06-24T10:00:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Developing Apps that scale: Principles and Patterns',
        abstract: '',
        authors: [
          {
            name : "Mahesh Lal",
            linkedin_profile_url: 'https://in.linkedin.com/in/maheshlal',
            image_url: 'images/speakers/mahesh-lal.png'
          }
        ],
        time: {
          start_time: new Date('2017-06-24T11:00:00+05:30')
        }
      },
      {
        type: AgendaEntryType.Talk,
        title: ' Building software for a bootstrapped business',
        abstract: '',
        authors: [
          {
            name : "Subbu Athikunte",
            linkedin_profile_url: 'https://www.linkedin.com/in/athikunte/'
          }
        ],
        time: {
          start_time: new Date('2017-06-24T12:00:00+05:30')
        }
      }
    ],
    color: '#040509',
    image_url: '/images/events/applications-scale.jpeg',
    meetup_urlname: 'devday_chennai',
    meetup_event_id: '240836694',
    form: {
      spreadsheetId : '1dySpYU4nW8mxVxkt8Zzju72HpuE_5DBdzU-RvwOVu18',
      sheetName : 'Form Responses 1'
    }
  },
  {
    title: 'Make your data talk!',
    url: 'make-your-data-talk',
    categories: ['events'],
    tags: ['data', 'visualisation'],
    author: 'devday_team',
    abstract: 'This DevDay will have talks focussing on building applications around data.',
    event_time: {
      start_time: new Date('2017-07-29T10:30:00+05:30'),
      end_time: new Date('2017-07-29T13:00:00+05:30'),
    },
    publish_time: new Date('2017-03-02T18:30:00+05:30'),
    registration_time: {
      start_time: new Date('2017-06-02T18:30:00+05:30'),
      end_time: new Date('2017-07-29T10:30:00+05:30'),
    },
    venue: CHENNAI_ADDRESS,
    agenda: [
      {
        type: AgendaEntryType.Talk,
        title: 'Baby Steps Towards a Tech Strategy in an Enterprise Labyrinth: A Tech Preview',
        abstract: 'The Data Team helps big and small enterprises realize value from data with the right strategic vision. We will talk about an ingestion platform we built both in its technical depth of evolution as well as value generation towards a bigger data strategy',
        authors: [
          {
            name: 'Ankit and Ganesh, The Data Team',
            linkedin_profile_url: '',
            image_url: ''
          }
        ],
        time: {
          start_time: new Date('2017-07-29T10:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Making data "talk" and "drive" insights',
        abstract: 'There is something magical about exploring large amounts of data and presenting it, as simply as we can, to drive insights/decision making. In this talk, we will cover popular ways to visualize data on the web. We will look at interactive data viz examples from popular charting libraries like highcharts, d3 etc.',
        authors: [
          {
            name : "Srimathi, Sahaj Software",
            linkedin_profile_url: 'https://www.linkedin.com/in/shrimats/',
            image_url: 'images/speakers/srimathi.jpg'
          }
        ],
        time: {
          start_time: new Date('2017-07-29T11:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Lunch and networking',
        abstract: '',
        authors: [],
        time: {
          start_time: new Date('2017-07-29T12:30:00+05:30')
        }
      } as AgendaEntry,
    ],
    color: '#040509',
    image_url: '/images/events/data-talk.jpeg',
    meetup_urlname: 'devday_chennai',
    meetup_event_id: '241588646',
    form: {
      spreadsheetId : '1dySpYU4nW8mxVxkt8Zzju72HpuE_5DBdzU-RvwOVu18',
      sheetName : 'Form Responses 1'
    }
  },
  {
    title: 'Lets Teach Machines..',
    url: 'lets-teach-machines',
    categories: ['events'],
    tags: ['data', 'machine learning', 'ml', 'artificial intelligence', 'ai'],
    author: 'devday_team',
    abstract: 'yup, lets teach machines..a course on machine learning.. Spanning over four days.. We will explain you the techniques used in ML from scratch with maths behind the scene and a hands on in R on the concept. Course will be on every subsequent Saturdays starting from 9th Sept 2017',
    event_time: {
      start_time: new Date('2017-09-09T10:00:00+05:30'),
      end_time: new Date('2017-09-09T16:00:00+05:30'),
    },
    publish_time: new Date('2017-03-02T18:30:00+05:30'),
    registration_time: {
      start_time: new Date('2017-08-29T10:00:00+05:30'),
      end_time: new Date('2017-09-09T10:00:00+05:30'),
    },
    venue: BANGALORE_ADDRESS,
    agenda: [
      {
        type: AgendaEntryType.Talk,
        title: 'Introduction to machine learning',
        abstract: '* What is ML\n* What is AI\n* What is DL',
        authors:[
          {
            name: 'Swaminathan Ganesan, Solution Consultant - Sahaj',
            linkedin_profile_url: '',
            image_url: ''
          }
        ],
        time: {
          start_time: new Date('2017-09-09T10:00:00+05:30')
        }
      },
      {
        type: AgendaEntryType.Talk,
        title: 'Introduction to R',
        abstract: '* Installation and sanity check\n* What is AI\n* Basic DS in R and few operations related',
        authors: [],
        time: {
          start_time: new Date('2017-09-09T14:00:00+05:30')
        }
      }
    ],
    color: '#040509',
    image_url: '/images/events/teach-machines.jpg',
    meetup_urlname: 'devday_bangalore',
    meetup_event_id: '242827851',
    form: {
      spreadsheetId : '1dySpYU4nW8mxVxkt8Zzju72HpuE_5DBdzU-RvwOVu18',
      sheetName : 'Form Responses 1'
    }
  },
  {
    title: 'DEVMERGE_',
    url: 'devmerge',
    categories: ['events'],
    tags: ['hackathon', 'devmerge'],
    author: 'devday_team',
    abstract: 'DEVMERGE_ is a hackathon where work is play and play is work. It has been our dream to bring together the best of hackers under one roof over a weekend and let them play! This August, our dream comes true.',
    event_time: {
      start_time: new Date('2017-08-19T12:30:00+05:30'),
      end_time: new Date('2017-08-20T12:00:00+05:30'),
    },
    publish_time: new Date('2017-03-02T18:30:00+05:30'),
    registration_time: {
      start_time: new Date('2017-06-02T18:30:00+05:30'),
      end_time: new Date('2017-07-29T10:30:00+05:30'),
    },
    venue: CHENNAI_ADDRESS,
    agenda:[],
    details: '### Winners\n'
        + '#### [First Prize: Techno Titans, SKCT Coimbatore](https://drive.google.com/file/d/0Bzbu-2OjDNYQbmRhVGdzV0QzamM/view?usp=sharing)\n'
        + 'A Ajai Srikanth, S Ashwin Karthik and A Balaji\n'
        + '#### Second Prize: Diabetic Aid, IIT Madras\n'
        + 'S Sathiyamoorthy, Sowmiya C and B Chandran\n'
        + '#### Third Prize: Intelitixians, InteliTix Solutions\n'
        + 'Ayyalu	and Satish',
    color: '#040509',
    image_url: '/images/events/ideas-hackathon.jpg',
    meetup_urlname: 'devday_chennai',
    meetup_event_id: '241139843',
    form: {
      spreadsheetId : '1dySpYU4nW8mxVxkt8Zzju72HpuE_5DBdzU-RvwOVu18',
      sheetName : 'Form Responses 1'
    }
  },
  {
    title: 'Ideas from DEVMERGE_',
    url: 'devmerge-ideas',
    categories: ['events'],
    tags: ['hackathon', 'ideas'],
    author: 'devday_team',
    abstract: 'Hackers who hacked during DEVMERGE_ (a hackathon organised by Sahaj Software and TiE Chennai) will take us through on the their journey from ideation to development, discuss on the tech stack and the inspirations they had to build the idea. We got to see this during DEVMERGE_. As we enjoyed it, We thought of opening it up to a wider audience. Come and spend couple of hours and see it yourself.',
    event_time: {
      start_time: new Date('2017-09-14T10:30:00+05:30'),
      end_time: new Date('2017-09-14T13:00:00+05:30'),
    },
    publish_time: new Date('2017-03-02T18:30:00+05:30'),
    registration_time: {
      start_time: new Date('2017-07-02T18:30:00+05:30'),
      end_time: new Date('2017-09-14T18:00:00+05:30'),
    },
    venue: CHENNAI_ADDRESS,
    agenda: [
      {
        type: AgendaEntryType.Talk,
        title: 'Git Rollback - generating code from voice',
        abstract: 'Simplix is an Android app where anyone can learn how to code, and quickly generate large segments of code directly from their voice. [More...](https://drive.google.com/open?id=0Bzbu-2OjDNYQUTNDLVVwYmxta28)',
        time: {
          start_time: new Date('2017-07-29T18:30:00+05:30')
        }
        // TODO: Fix any cast
      } as any as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'House Stark - an interactive museum using AR',
        abstract: 'People love museums. But they don\'t go there. So we get the museum to them. With a little bit of AR. [More...](https://drive.google.com/open?id=0Bzbu-2OjDNYQTHBDRlpHY1JwSlU)',
        time: {
          start_time: new Date('2017-07-29T19:10:00+05:30')
        }
      } as any as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Vangogh - Applying Texture from one image to another using ML',
        abstract: 'We all love photos. We love paintings too. What if our everyday photos can have the feel of a painting? [More...](https://drive.google.com/open?id=0Bzbu-2OjDNYQVWtpZjM2NkFSZGs)',
        time: {
          start_time: new Date('2017-07-29T19:50:00+05:30')
        }
      } as any as AgendaEntry,
    ],
    color: '#040509',
    image_url: '/images/events/ideas-hackathon.jpg',
    meetup_urlname: 'devday_chennai',
    meetup_event_id: '243038919',
    form: {
      spreadsheetId : '1dySpYU4nW8mxVxkt8Zzju72HpuE_5DBdzU-RvwOVu18',
      sheetName : 'Form Responses 1'
    }
  },
  {
    title: 'Lets Teach Machines.. (2)',
    url: 'lets-teach-machines-week-2',
    categories: ['events'],
    tags: ['data', 'machine learning', 'ml', 'artificial intelligence', 'ai'],
    author: 'devday_team',
    abstract: 'Second session of the series \"Lets Teach Machines\". In this session we will cover regression analysis with hands-on. In the first session, we have covered introduction to ML, probability, introduction to statistics, permutations, basic distributions and an introduction to R. If you missed it, do a brush up of these things and show up..',
    event_time: {
      start_time: new Date('2017-09-16T10:00:00+05:30'),
      end_time: new Date('2017-09-16T16:00:00+05:30'),
    },
    publish_time: new Date('2017-09-09T18:30:00+05:30'),
    registration_time: {
      start_time: new Date('2017-09-09T18:30:00+05:30'),
      end_time: new Date('2017-09-16T10:00:00+05:30'),
    },
    venue: BANGALORE_ADDRESS,
    agenda: [
      {
        type: AgendaEntryType.Talk,
        title: 'Regression analysis',
        abstract: '* Linear Regression\n* Logistic Regression',
        authors: [
          {
            name: 'Dileep Bapat',
            linkedin_profile_url: 'https://www.linkedin.com/in/dileepbapat/',
            image_url: 'images/speakers/dileep.jpg'
          }
        ],
        time: {
          start_time: new Date('2017-09-16T10:00:00+05:30')
        }
      }
    ],
    color: '#040509',
    image_url: '/images/events/teach-machines.jpg',
    meetup_urlname: 'devday_bangalore',
    meetup_event_id: '243276467',
    form: {
      spreadsheetId: '1dySpYU4nW8mxVxkt8Zzju72HpuE_5DBdzU-RvwOVu18',
      sheetName: 'Form Responses 1'
    }
  },
  {
    title: 'Lets Teach Machines.. (3)',
    url: 'lets-teach-machines-week-3',
    categories: ['events'],
    tags: ['data', 'machine learning', 'ml', 'artificial intelligence', 'ai'],
    author: 'devday_team',
    abstract: 'Learning continues to the third session of the series \"Lets Teach Machines\". In this session, we will cover Classification Techniques and Market Basket Analysis.',
    event_time: {
      start_time: new Date('2017-09-23T10:00:00+05:30'),
      end_time: new Date('2017-09-23T16:00:00+05:30'),
    },
    publish_time: new Date('2017-09-16T18:30:00+05:30'),
    registration_time: {
      start_time: new Date('2017-09-16T10:30:00+05:30'),
      end_time: new Date('2017-09-23T10:00:00+05:30'),
    },
    venue: BANGALORE_ADDRESS,
    agenda: [
      {
        type: AgendaEntryType.Talk,
        title: 'Classification',
        abstract: 'Supervised and unsupervised',
        authors: [
          {
            name: 'Devangana Khokhar',
            linkedin_profile_url: 'https://twitter.com/DevanganaK',
            image_url: 'https://pbs.twimg.com/profile_images/785919292067819520/9uQnsu37_400x400.jpg'
          }
        ],
        time: {
          start_time: new Date('2017-09-23T10:00:00+05:30')
        }
      },
      {
        type: AgendaEntryType.Talk,
        title: 'Market Basket Analysis',
        abstract: 'Techniques used for sales predictions',
        authors: [
        ],
        time: {
          start_time: new Date('2017-09-23T14:00:00+05:30')
        }
      }
    ],
    color: '#040509',
    image_url: '/images/events/teach-machines.jpg',
    meetup_urlname: 'devday_bangalore',
    meetup_event_id: '243411983',
    form: {
      spreadsheetId: '1dySpYU4nW8mxVxkt8Zzju72HpuE_5DBdzU-RvwOVu18',
      sheetName: 'Form Responses 1'
    }
  },
  {
    title: 'Breaking down Blockchain',
    url: 'blockchain-decrypted',
    categories: ['events'],
    tags: ['blockchain', 'ethereum '],
    author: 'devday_team',
    abstract: 'With blockchain being an emerging technology, this DevDay will give an introduction to the blockchain concept. We will then explore how it is being used in the industry.',
    event_time: {
      start_time: new Date('2017-10-12T18:30:00+05:30'),
      end_time: new Date('2017-10-12T20:30:00+05:30'),
    },
    publish_time: new Date('2017-09-02T18:30:00+05:30'),
    registration_time: {
      start_time: new Date('2017-09-02T18:30:00+05:30'),
      end_time: new Date('2017-10-29T10:30:00+05:30'),
    },
    venue: CHENNAI_ADDRESS,
    agenda: [
      {
        type: AgendaEntryType.Talk,
        title: 'Introduction to Blockchain and Ethereum',
        abstract: '',
        authors: [
          {
            name: 'Zahoor Mohammed, Ethereum Foundation',
            linkedin_profile_url: 'https://www.linkedin.com/in/j-mohamed-zahoor-294b1020/?ppe=1',
            image_url: 'https://media.licdn.com/media/AAEAAQAAAAAAAA3LAAAAJDM4MTI0YmRkLTk2MzgtNGRlNi1iNWEyLTE0MzVjZjQ2ZGY3Mg.jpg'
          }
        ],
        time: {
          start_time: new Date('2017-10-12T18:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'How can blockchain help prevent fraud?',
        abstract: 'This talk will explore how the blockchain concept was used to build a platform to aid invoice discounting',
        authors: [
          {
            name : "Satish Salivati, InteliTix Solutions",
            linkedin_profile_url: 'https://www.linkedin.com/in/satishsalivati/',
            image_url: 'https://media.licdn.com/media/AAEAAQAAAAAAAA1YAAAAJGQxZGI4ZDc5LWUyNDctNDhmNC1iMzQwLTM4M2ViMDZlNGFjZg.jpg'
          }
        ],
        time: {
          start_time: new Date('2017-10-12T19:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Dinner and networking',
        abstract: '',
        authors: [],
        time: {
          start_time: new Date('2017-10-12T20:30:00+05:30')
        }
      } as AgendaEntry,
    ],
    color: '#040509',
    image_url: '/images/events/blockchain.jpeg',
    meetup_urlname: 'devday_chennai',
    meetup_event_id: '243513680',
    form: {
      spreadsheetId : '1dySpYU4nW8mxVxkt8Zzju72HpuE_5DBdzU-RvwOVu18',
      sheetName : 'Form Responses 1'
    }
  },
  {
    title: 'Lets Teach Machines.. (4)',
    url: 'lets-teach-machines-week-4',
    categories: ['events'],
    tags: ['data', 'machine learning', 'ml', 'artificial intelligence', 'ai'],
    author: 'devday_team',
    abstract: 'This time in \"Lets Teach Machines\" we will play with real data, with all the algorithms we have learned. This is pretty simple, gather together, form into small groups, find a problem, solve and share your findings.  We will be happy if you have a problem in mind.',
    event_time: {
      start_time: new Date('2017-10-28T10:00:00+05:30'),
      end_time: new Date('2017-10-28T16:30:00+05:30'),
    },
    publish_time: new Date('2017-10-16T18:30:00+05:30'),
    registration_time: {
      start_time: new Date('2017-10-16T10:30:00+05:30'),
      end_time: new Date('2017-10-28T10:00:00+05:30'),
    },
    venue: BANGALORE_ADDRESS,
    agenda: [
      {
        type: AgendaEntryType.Talk,
        title: 'Introduction',
        abstract: '',
        authors: [],
        time: {
          start_time: new Date('2016-10-28T10:00:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Problem Statements pitching and Discussion',
        abstract: '',
        authors: [],
        time: {
          start_time: new Date('2016-10-28T10:15:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Workshop,
        title: 'Dive into Data',
        abstract: '',
        authors: [],
        time: {
          start_time: new Date('2016-10-28T11:00:00+05:30')
        }
      } as AgendaEntry,

      {
        type: AgendaEntryType.Break,
        time: {
          start_time: new Date('2016-10-28T13:00:00+05:30')
        },
        title: 'Lunch Break'
      } as AgendaEntry,
      {
        type: AgendaEntryType.Workshop,
        title: 'Dive into Data (resume)',
        abstract: '',
        authors: [],
        time: {
          start_time: new Date('2016-10-28T13:45:00+05:30')
        }
      } as AgendaEntry,

      {
        type: AgendaEntryType.Talk,
        title: 'Shareback',
        abstract: '',
        authors: [],
        time: {
          start_time: new Date('2016-10-28T16:00:00+05:30')
        }
      } as AgendaEntry

    ],
    color: '#040509',
    image_url: '/images/events/teach-machines.jpg',
    meetup_urlname: 'devday_bangalore',
    meetup_event_id: '244343746',
    form: {
      spreadsheetId: '1dySpYU4nW8mxVxkt8Zzju72HpuE_5DBdzU-RvwOVu18',
      sheetName: 'Form Responses 1'
    }
  },
  {
    title: 'Red Green Refactor',
    url: 'red-green-refactor',
    categories: ['events'],
    tags: ['tdd', 'spock', 'junit'],
    author: 'devday_team',
    abstract: 'This DevDay will be focussed on Test Driven Development. We start with a talk on Spock and how it is different from other Java based testing frameworks. We are looking for another speaker so feel free to reach out to us.',
    event_time: {
      start_time: new Date('2017-11-16T18:30:00+05:30'),
      end_time: new Date('2017-11-16T20:30:00+05:30'),
    },
    publish_time: new Date('2017-09-02T18:30:00+05:30'),
    registration_time: {
      start_time: new Date('2017-09-02T18:30:00+05:30'),
      end_time: new Date('2017-11-16T18:30:00+05:30'),
    },
    venue: CHENNAI_ADDRESS,
    agenda: [
      {
        type: AgendaEntryType.Talk,
        title: 'Spock - a testing framework',
        abstract: 'Spock is a expressive testing framework for JVM languages. It is a DSL framework written on Groovy. Compared to JUnit, Spock enforces Setup - Trigger - Assert paradigm. With DSL based approach, developer can think to write test code differently than production code. Spock runs on JUnit Runner, so existing test environment can be reused.',
        authors: [
          {
            name: 'Parani Raja, XVela',
            linkedin_profile_url: 'https://www.linkedin.com/in/paraniraja/',
            image_url: 'https://media.licdn.com/media/AAEAAQAAAAAAAAL4AAAAJDViYjM1YmUyLTc5MTAtNGVkNi04MjlhLTgxMjhiODA1NTM2OA.jpg'
          }
        ],
        time: {
          start_time: new Date('2017-10-12T18:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'TBD',
        abstract: '',
        authors: [
          {
            name : "",
            linkedin_profile_url: '',
            image_url: ''
          }
        ],
        time: {
          start_time: new Date('2017-10-12T19:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Dinner and networking',
        abstract: '',
        authors: [],
        time: {
          start_time: new Date('2017-10-12T20:30:00+05:30')
        }
      } as AgendaEntry,
    ],
    color: '#040509',
    image_url: '/images/events/code.jpeg',
    meetup_urlname: 'devday_chennai',
    meetup_event_id: '244373937',
    form: {
      spreadsheetId : '1dySpYU4nW8mxVxkt8Zzju72HpuE_5DBdzU-RvwOVu18',
      sheetName : 'Form Responses 1'
    }
  }
  // TODO: Remove cast
] as DevdayEvent[];
export default events;
