import hatch from "../";

test("you can hatch an egg", () => {
  const egg = () => {};
  hatch(egg);
});

test("hatching eggs breed things", () => {
  const egg = ({ breed }) => breed("chick", () => true);
  const { chick } = hatch(egg);
  expect(chick).toBe(true);
});

test("breed receives previous breeds", () => {
  const egg = ({ breed }) => {
    breed("chick", () => 1);
    breed("chick", ({ chick }) => chick + 1);
  };

  const { chick } = hatch(egg);
  expect(chick).toBe(2);
});

test("breed multiple things", () => {
  const egg = ({ breed }) => {
    breed("chick", () => true);
    breed("duckling", () => true);
  };

  const { chick, duckling } = hatch(egg);

  expect(chick).toBe(true);
  expect(duckling).toBe(true);
});

test("breed receives other things, not matter the order", () => {
  const egg = ({ breed }) => {
    breed("chick", ({ small }) => small);
    breed("small", () => true);
  };

  const { chick } = hatch(egg);

  expect(chick).toBe(true);
});

test("breed function does nothing if result is not asked", () => {
  const log = [];

  const egg = ({ breed }) => {
    breed("chick", ({ small }) => log.push("chick"));
    breed("small", () => log.push("small"));
    breed("big", () => log.push("big"));
  };

  const { chick } = hatch(egg);
  expect(log).toEqual(["small", "chick"]);
});

test("breed functions executes at most once", () => {
  const log = [];

  const egg = ({ breed }) => {
    breed("chick", ({ small }) => log.push("chick"));
    breed("small", () => log.push("small"));
    breed("big", () => log.push("big"));
  };

  const hatchery = hatch(egg);
  hatchery.chick;
  hatchery.chick;
  expect(log).toEqual(["small", "chick"]);
});

test("multiple eggs", () => {
  const chickenEgg = ({ breed }) => breed("chick", () => true);
  const duckEgg = ({ breed }) => breed("duckling", () => true);

  const { chick, duckling } = hatch(chickenEgg, duckEgg);

  expect(chick).toBe(true);
  expect(duckling).toBe(true);
});

test("multiple eggs nested array", () => {
  const chickenEgg = ({ breed }) => breed("chick", () => true);
  const duckEgg = ({ breed }) => breed("duckling", () => true);

  const { chick, duckling } = hatch([[chickenEgg, [[duckEgg]]]]);

  expect(chick).toBe(true);
  expect(duckling).toBe(true);
});

test("incubator adds more tools to hatch other eggs", () => {
  const plumageEgg = ({ incubator }) =>
    incubator("withPlumage", bird => ({ ...bird, plumage: true }));

  const chickenEgg = ({ breed, withPlumage }) =>
    breed("chick", () => withPlumage({ chick: true }));

  const { chick } = hatch(plumageEgg, chickenEgg);

  expect(chick).toEqual({ chick: true, plumage: true });
});

test("incubators are executed before hatching and they are designed to concrete the new breed", () => {
  const chickenEgg = ({ incubator, breed }) => {
    let color = "white";
    incubator("withColor", newColor => (color = newColor));
    breed("chick", () => ({ chick: true, color }));
  };

  const yellowChicksEgg = ({ withColor }) => {
    withColor("yellow");
  };

  const { chick } = hatch(chickenEgg, yellowChicksEgg);

  expect(chick).toEqual({ chick: true, color: "yellow" });
});

test("incubators can overwrite and use previous incubators", () => {
  const chickenEgg = ({ incubator, breed }) => {
    let color = "white";
    incubator("withColor", newColor => (color = newColor));
    breed("chick", () => ({ chick: true, color }));
  };

  const ishColoredChicksEgg = ({ incubator, withColor }) => {
    incubator("withColor", color => withColor(color + "ish"));
  };

  const yellowChicksEgg = ({ withColor }) => {
    withColor("yellow");
  };

  const { chick } = hatch(chickenEgg, ishColoredChicksEgg, yellowChicksEgg);

  expect(chick).toEqual({ chick: true, color: "yellowish" });
});

test("incubators, unlike breeds, are executed in the hatch order", () => {
  const eggEgg = ({ incubator }) => {
    incubator("chickDNA", "CACAGAATA");
  };
  const chickenEgg = ({ chickDNA, breed }) => {
    breed("chick", () => ({ chickDNA }));
  };

  const eggThenChick = hatch(eggEgg, chickenEgg).chick;
  const chickThenEgg = hatch(chickenEgg, eggEgg).chick;

  expect(eggThenChick).toEqual({ chickDNA: "CACAGAATA" });
  expect(chickThenEgg).toEqual({ chickDNA: undefined });
});
