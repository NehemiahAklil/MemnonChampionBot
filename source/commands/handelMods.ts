import { mentionHTML } from './../utils/index';
import { getUser, getFullName } from './../utils';
import { MyContext } from './../context.interface';
import { Moderator, IModerator } from '../database/models/models.interface';
import { html as format } from 'telegram-format';

export const makeChatMod = async (ctx: MyContext): Promise<void> => {
  try {
    const user = getUser(ctx);
    if (!user) return;
    //? Check if the user is already moderator
    const isMod: IModerator = await ctx.db?.Moderator.findOne({
      telegramId: user.id,
    });
    if (isMod) {
      let modType = 'moderator.global.already_mod';
      if (!isMod.isGlobal) {
        if (!isMod.chatIds?.includes(<number>ctx.chat?.id) && ctx.chat?.id) {
          isMod.chatIds?.push(ctx.chat?.id);
          const chatMod = await ctx.db?.Moderator.findOneAndUpdate(
            {
              telegramId: user.id,
            },
            isMod,
            { new: true }
          );
          ctx.replyWithHTML(
            <string>ctx.i18n?.t('moderator.chat.new_mod', {
              mention: format.userMention(chatMod.name, chatMod.telegramId),
              title: chatMod?.title,
            })
          );
          return;
        }
        modType = 'moderator.chat.already_mod';
      }
      ctx.reply(
        <string>ctx.i18n?.t(modType, {
          firstName: user.first_name,
        }),
        {
          reply_to_message_id: ctx.message?.message_id,
          allow_sending_without_reply: true,
        }
      );
      return;
    }
    let chatMod: Moderator = {
      name: getFullName(user),
      telegramId: user.id,
      title: ctx.state.opts?.args ? ctx.state.opts?.args : 'moderator',
    };
    if (ctx.chat?.id) {
      chatMod.chatIds = [ctx.chat?.id];
    }
    const newChatMod = await ctx.db?.Moderator.create(chatMod);
    if (!newChatMod) return;
    let modInfo: {
      mention: string;
      title?: string;
      chat?: string;
    } = {
      mention: format.userMention(
        <string>newChatMod.name,
        newChatMod.telegramId
      ),
      title: newChatMod?.title,
    };
    if (newChatMod?.chatIds && newChatMod?.chatIds.length) {
      ctx.replyWithHTML(
        <string>ctx.i18n?.t('moderator.global.new_mod', modInfo)
      );
    } else {
      if (ctx.chat && 'title' in ctx.chat) {
        modInfo.chat = ctx.chat?.title;
      }
      ctx.replyWithHTML(<string>ctx.i18n?.t('moderator.chat.new_mod', modInfo));
    }
  } catch (err) {
    console.log(err);
    ctx.sendError(err, ctx);
  }
};
export const removeChatMod = async (ctx: MyContext): Promise<void> => {
  try {
    const user = getUser(ctx);
    if (!user) return;
    //? Check if the user is already moderator
    const isMod: IModerator = await ctx.db?.Moderator.findOne({
      telegramId: user.id,
    });
    if (!isMod) return;
    if (isMod.isGlobal) {
      ctx.replyWithHTML(
        <string>ctx.i18n?.t('moderator.global.is_mod', {
          firstName: isMod.name,
        })
      );
      return;
    }
    if (!isMod.chatIds?.includes(<number>ctx.chat?.id)) {
      ctx.replyWithHTML(
        <string>ctx.i18n?.t('moderator.chat.is_not_mod', {
          firstName: isMod.name,
        })
      );
      return;
    }
    isMod.chatIds = isMod.chatIds?.filter((chat) => chat !== ctx.chat?.id);
    const chatMod = await ctx.db?.Moderator.findOneAndUpdate(
      {
        telegramId: user.id,
      },
      isMod,
      { new: true }
    );
    ctx.replyWithHTML(
      <string>ctx.i18n?.t('moderator.chat.rm_mod', {
        mention: mentionHTML(chatMod.name, chatMod.telegramId),
        title: chatMod?.title,
      })
    );
    return;
  } catch (err) {
    console.log(err);
    ctx.sendError(err, ctx);
  }
};
export const makeGlobalMod = async (ctx: MyContext) => {
  try {
    const user = getUser(ctx);
    if (!user) return;
    //? Check if the user is already moderator
    const isMod = await ctx.db?.Moderator.findOne({
      telegramId: user.id,
    });
    if (!isMod) {
      let chatMod: Moderator = {
        name: getFullName(user),
        telegramId: user.id,
        isGlobal: true,
        title: ctx.state.opts?.args ? ctx.state.opts?.args : 'moderator',
      };
      const newGMod = await ctx.db?.Moderator.create(chatMod);
      if (!newGMod) return;
      ctx.replyWithHTML(
        <string>ctx.i18n?.t('moderator.global.new_mod', {
          mention: mentionHTML(newGMod.name, newGMod.telegramId),
          title: newGMod?.title,
        })
      );
      return;
    }
    if (isMod?.isGlobal) {
      ctx.reply(
        <string>ctx.i18n?.t('moderator.global.already_mod', {
          firstName: user.first_name,
        }),
        {
          reply_to_message_id: ctx.message?.message_id,
          allow_sending_without_reply: true,
        }
      );
      return;
    }
    const newGMod = await ctx.db?.Moderator.findOneAndUpdate(
      {
        telegramId: user.id,
      },
      {
        isGlobal: true,
        chatIds: [],
        telegramId: user.id,
      },
      { new: true }
    );
    ctx.replyWithHTML(
      <string>ctx.i18n?.t('moderator.global.new_mod', {
        mention: mentionHTML(newGMod.name, newGMod.telegramId),
        title: newGMod?.title,
      })
    );
  } catch (err) {
    console.log(err);
    ctx.sendError(err, ctx);
  }
};
export const removeGlobalMod = async (ctx: MyContext) => {
  try {
    const user = getUser(ctx);
    if (!user) return;
    //? Check if the user is already moderator
    const isMod: IModerator = await ctx.db?.Moderator.findOne({
      telegramId: user.id,
    });
    if (!isMod) return;
    if (!isMod.isGlobal) {
      ctx.replyWithHTML(
        <string>ctx.i18n?.t('moderator.global.not_mod', {
          firstName: isMod.name,
        })
      );
      return;
    }

    const removedGMod = await ctx.db?.Moderator.findOneAndDelete({
      telegramId: user.id,
    });
    ctx.replyWithHTML(
      <string>ctx.i18n?.t('moderator.global.rm_mod', {
        mention: mentionHTML(removedGMod.name, removedGMod.telegramId),
        title: removedGMod.title,
      })
    );
    return;
  } catch (err) {
    console.log(err);
    ctx.sendError(err, ctx);
  }
};
export const listChatMod = async (ctx: MyContext) => {
  try {
    //* Get moderators list
    console.log(ctx.chat?.id);
    const Mods: IModerator[] = await ctx.db?.Moderator.find({
      chatIds: ctx.chat?.id,
    });
    console.log(Mods);
    let title = ctx.i18n?.t('moderator.chat.list_title');
    let modsList = ctx.i18n?.t('moderator.list_mod.title');
    let modCount = 0;
    Mods.forEach((mod) => {
      modsList += <string>ctx.i18n?.t('moderator.list_mod.mention', {
        mention: format.userMention(format.escape(mod.name), mod.telegramId),
        title: mod.title,
      });
      modCount++;
    });
    if (!modCount) {
      modsList += <string>ctx.i18n?.t('moderator.list_mod.no_mods', {
        type: 'chat',
      });
    }
    ctx.replyWithHTML(<string>title + modsList);
  } catch (err) {
    console.log(err);
    ctx.sendError(err, ctx);
  }
};
export const listGlobalMod = async (ctx: MyContext) => {
  try {
    //* Get moderators list
    const Mods: IModerator[] = await ctx.db?.Moderator.find({
      isGlobal: true,
    });
    let title = ctx.i18n?.t('moderator.global.list_title');
    let modsList = ctx.i18n?.t('moderator.list_mod.title');
    let modCount = 0;
    let ownerList = ctx.i18n?.t('moderator.list_owner.title');
    Mods.forEach((mod) => {
      if (mod.isOwner) {
        ownerList += <string>ctx.i18n?.t('moderator.list_owner.mention', {
          mention: mentionHTML(mod.name, mod.telegramId),
          title: mod.title,
        });
        return;
      }
      modsList += <string>ctx.i18n?.t('moderator.list_mod.mention', {
        mention: mentionHTML(mod.name, mod.telegramId),
        title: mod.title,
      });
      modCount++;
    });
    if (!modCount) {
      modsList += <string>(
        ctx.i18n?.t('moderator.list_mod.no_mods', { type: 'global' })
      );
    }
    ctx.replyWithHTML(<string>title + ownerList + modsList);
  } catch (err) {
    console.log(err);
    ctx.sendError(err, ctx);
  }
};
export const contactDev = async (ctx: MyContext) => {
  return ctx.replyWithHTML(<string>ctx.i18n?.t('dev'));
};
