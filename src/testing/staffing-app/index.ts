import { createStaffingAppInstance } from "./staffing";
import Chance from "chance";

const chance = new Chance();

async function init() {
  const [app, scaffold] = await createStaffingAppInstance();

  await scaffold.createDatabase();

  const t = await scaffold.model["Project"].create({
    name: chance.word(),
    description: chance.sentence(),
  });

  console.log("t=>", t);

  const data: any = [];

  for (let index = 0; index < 10; index++) {
    data.push({
      name: chance.word(),
      start_confidence: chance.floating({ min: 0, max: 1 }),
      end_confidence: chance.floating({ min: 0, max: 1 }),
      start_date: "8-8-2021",
      end_date: "9-9-2023",
      project: {
        id: t.getDataValue("id"),
      },
      skills: [
        {
          name: chance.word(),
        },
        {
          name: chance.word(),
        },
        {
          name: chance.word(),
        },
      ],
    });
  }

  const t2 = await scaffold.model["Role"].bulkCreate(data);

  console.log("t2 =>", t2);

  app.listen(3000, () => {
    console.log("Scaffold Started");
  });
}

init();
