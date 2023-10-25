import { UserModel } from "../../mongo/schemas/user";
import { TUser } from "../../types/userType";


export class UserService {
    async createUser(user: TUser){
        try{
            return await UserModel.create(user);
        }catch(e){
            console.log(e);
        }
        
    }
    
    async getUserInfo(id: String){
        const res = await UserModel.findOne({id});
        console.log(res);
        return res;
    }
}
