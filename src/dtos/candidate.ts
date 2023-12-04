import { HydratedDocument } from "mongoose";

import { IUser } from "../models/user";

class CandidateDTO {
  duck;
  id;

  constructor(candidate: HydratedDocument<IUser>) {
    this.duck = candidate.duck;
    this.id = candidate._id;
  }
}

export default CandidateDTO;
