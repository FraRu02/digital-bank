import { type CreateEmailOptions, type CreateEmailRequestOptions, type CreateEmailResponse, Resend } from "resend";



class ResendEmail {
  private static instance:ResendEmail;
  private resend:Resend = new Resend(process.env.RESEND_KEY);

  private constructor() {
  }

  static getInstance() {
    if(!ResendEmail.instance) {
      ResendEmail.instance = new this();
    }
    return ResendEmail.instance;
  }

  // static getInstance<T extends ResendEmail>(
  //   this: new (...args: any[]) => T,
  //   ...args: ConstructorParameters<typeof ResendEmail>
  // ): T {
  //   if (!ResendEmail.instances.has(this)) {
  //     ResendEmail.instances.set(this, new this(...args));
  //   }
  //   return ResendEmail.instances.get(this);
  // }


  async sendEmail(payload: Omit<CreateEmailOptions, "from">, options?: CreateEmailRequestOptions): Promise<CreateEmailResponse> {
    try {
      const response = await this.resend.emails.send({
        from: "NexaBank <no-reply@nexabank.it>",
        // from: "NexaBank <onboarding@resend.dev>",
        ...payload as any,
      }, options);
      if(response.error) throw response.error;
      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

ResendEmail.getInstance();

export default ResendEmail;