import usersService from "../services/users";

export default function startFindingMatchs() {
  const delay = process.env.FIND_MATCHS_DELAY;
  if (!delay) {
    throw new Error("FIND_MATCHS_DELAY absent");
  }
  async function findMatchs() {
    const users = await usersService.getAll();
    for (let i = 0; i < users.length; i++) {
      for (let j = 0; j < users.length; j++) {
        if (j === i) {
          continue;
        }
        const isMatchExisted =
          users[i].matchs.includes(users[j]._id as unknown as string) ||
          users[i].newMatchs.includes(users[j]._id as unknown as string);

        if (isMatchExisted) {
          continue;
        }

        const isMatch =
          users[i].liked.includes(users[j]._id as unknown as string) &&
          users[j].liked.includes(users[i]._id as unknown as string);
        if (isMatch) {
          users[i].newMatchs.push(users[j]._id as unknown as string);
          users[j].newMatchs.push(users[i]._id as unknown as string);
          // todo: add notifications
          try {
            await Promise.all([users[i].save(), users[j].save()]);
          } catch (err) {
            console.log(err);
          }
        }
      }
    }
  }

  setInterval(findMatchs, +delay);
}
