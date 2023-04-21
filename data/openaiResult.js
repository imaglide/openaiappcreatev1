const appData = {
  name: "Test Project Management App",
  tables: [
    {
      name: "Companies",
      plural: "Companies",
      singular: "Company",
      columns: [
        {
          name: "Name",
          data_type: "text",
        },
        {
          name: "Description",
          data_type: "text-multi-line",
        },
      ],
    },
    {
      name: "Teams",
      plural: "Teams",
      singular: "Team",
      columns: [
        {
          name: "Name",
          data_type: "text",
        },
        {
          name: "Description",
          data_type: "text-multi-line",
        },
        {
          name: "Company ID",
          data_type: "numeric",
        },
      ],
    },
    {
      name: "Users",
      plural: "Users",
      singular: "User",
      columns: [
        {
          name: "Name",
          data_type: "text",
        },
        {
          name: "Email",
          data_type: "email",
        },
        {
          name: "Password",
          data_type: "text",
        },
        {
          name: "Team ID",
          data_type: "numeric",
        },
      ],
    },
    {
      name: "Projects",
      plural: "Projects",
      singular: "Project",
      columns: [
        {
          name: "Name",
          data_type: "text",
        },
        {
          name: "Description",
          data_type: "text-multi-line",
        },
        {
          name: "Start Date",
          data_type: "datetime",
        },
        {
          name: "End Date",
          data_type: "datetime",
        },
        {
          name: "Status",
          data_type: "text-multiple-choice",
        },
        {
          name: "Team ID",
          data_type: "numeric",
        },
        {
          name: "Assigned User IDs",
          data_type: "multitext",
        },
        {
          name: "Company ID",
          data_type: "numeric",
        },
      ],
    },
    {
      name: "Tasks",
      plural: "Tasks",
      singular: "Task",
      columns: [
        {
          name: "Name",
          data_type: "text",
        },
        {
          name: "Description",
          data_type: "text-multi-line",
        },
        {
          name: "Start Date",
          data_type: "datetime",
        },
        {
          name: "End Date",
          data_type: "datetime",
        },
        {
          name: "Status",
          data_type: "text-multiple-choice",
        },
        {
          name: "Project ID",
          data_type: "numeric",
        },
        {
          name: "Assigned User IDs",
          data_type: "multitext",
        },
      ],
    },
  ],

  relationships: [
    {
      from: "Companies",
      to: "Teams"
    },
    {
      from: "Teams",
      to: "Users"
    },
    {
      from: "Teams",
      to: "Projects"
    },
    {
      from: "Projects",
      to: "Companies"
    },
    {
      from: "Projects",
      to: "Tasks"
    },
  ],
};

module.exports = appData;
